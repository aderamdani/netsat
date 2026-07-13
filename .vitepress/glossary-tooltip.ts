import fs from 'node:fs'
import path from 'node:path'

// Diketik longgar (bukan `import type MarkdownIt from 'markdown-it'`) karena
// markdown-it cuma dependensi transitif vitepress di sini (pnpm strict),
// jadi paketnya sendiri tidak selalu resolvable untuk type-only import.
type MarkdownItLike = {
  core: { ruler: { push: (name: string, fn: (state: any) => void) => void } }
}

/**
 * Menautkan tooltip glosari (TermTooltip.vue) secara otomatis ke kemunculan
 * PERTAMA tiap istilah di tiap halaman — sumber definisi tetap satu:
 * mikrotik/glosari.md, jadi tak ada teks yang didup di dua tempat.
 *
 * Hanya istilah di AUTO_TERMS yang di-auto-tooltip: akronim/jargon yang
 * jarang dan memang butuh penjelasan, BUKAN kata pinjaman umum yang sudah
 * lazim dipakai apa adanya di seluruh situs (interface, gateway, packet,
 * subnet, bandwidth, dll — mengikuti konvensi penulisan di tentang.md).
 */
const AUTO_TERMS = [
  'ACM', 'ARP', 'BGP', 'Bonding', 'Burst', 'CAPsMAN', 'CGNAT', 'CHR', 'CIDR',
  'CIR', 'DDNS', 'DoH', 'DSCP', 'dst-nat', 'ECMP', 'EIRP', 'EoIP', 'FastTrack',
  'FEC', 'FSPL', 'Hairpin NAT', 'HTS', 'IKEv2', 'IPsec', 'L2TP', 'LACP', 'LNB',
  'MAC-telnet', 'Mangle', 'Masquerade', 'MF-TDMA', 'MSS', 'MTU', 'Netwatch',
  'OSPF', 'PCQ', 'PEP', 'PPPoE', 'RTT', 'SLAAC', 'SNMP', 'src-nat', 'STP',
  'Torch', 'TTL', 'VLSM', 'VRF', 'WireGuard',
]

const GLOSSARY_PAGE = 'mikrotik/glosari.md'

function parseGlossary(glosariPath: string): Map<string, string> {
  const raw = fs.readFileSync(glosariPath, 'utf-8')
  const map = new Map<string, string>()
  const entryRe = /\*\*([^*]+)\*\*\s*—\s*([\s\S]*?)(?=\n\n|$)/g
  let m: RegExpExecArray | null
  while ((m = entryRe.exec(raw))) {
    const term = m[1].trim()
    let def = m[2].replace(/\n/g, ' ').trim()
    def = def.replace(/\s*Lihat\s+\[.*$/s, '').trim()
    def = def.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')
    def = def.replace(/`([^`]*)`/g, '$1')
    if (def && !/[.!?]$/.test(def)) def += '.'
    if (term && def) map.set(term, def)
  }
  return map
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function applyGlossaryTooltips(md: MarkdownItLike, projectRoot: string): void {
  const full = parseGlossary(path.join(projectRoot, GLOSSARY_PAGE))
  const included = new Map<string, string>()
  for (const term of AUTO_TERMS) {
    const def = full.get(term)
    if (def) included.set(term, def)
  }
  if (included.size === 0) return

  const lookup = new Map<string, string>()
  for (const term of included.keys()) lookup.set(term.toLowerCase(), term)

  const escapedTerms = [...included.keys()]
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`\\b(${escapedTerms.join('|')})\\b`, 'i')

  md.core.ruler.push('ns-glossary-tooltip', (state) => {
    if (state.env?.relativePath === GLOSSARY_PAGE) return
    const used: Set<string> = state.env.__nsGlossaryUsed || (state.env.__nsGlossaryUsed = new Set())

    let headingDepth = 0
    for (const blockToken of state.tokens) {
      if (blockToken.type === 'heading_open') { headingDepth++; continue }
      if (blockToken.type === 'heading_close') { headingDepth--; continue }
      if (blockToken.type !== 'inline' || headingDepth > 0) continue
      if (!blockToken.children || !blockToken.children.length) continue

      const newChildren: typeof blockToken.children = []
      let linkDepth = 0

      for (const child of blockToken.children) {
        if (child.type === 'link_open') { linkDepth++; newChildren.push(child); continue }
        if (child.type === 'link_close') { linkDepth--; newChildren.push(child); continue }
        if (linkDepth > 0 || child.type !== 'text') { newChildren.push(child); continue }

        const content = child.content
        let cursor = 0
        let mutated = false

        while (cursor < content.length) {
          const rest = content.slice(cursor)
          const match = rest.match(pattern)
          if (!match || match.index === undefined) {
            if (mutated) {
              const tail = new state.Token('text', '', 0)
              tail.content = content.slice(cursor)
              newChildren.push(tail)
            }
            break
          }

          const matchedText = match[0]
          const matchStart = cursor + match.index
          const canonical = lookup.get(matchedText.toLowerCase())

          if (!canonical || used.has(canonical)) {
            cursor = matchStart + matchedText.length
            continue
          }

          used.add(canonical)
          mutated = true

          if (matchStart > cursor) {
            const before = new state.Token('text', '', 0)
            before.content = content.slice(cursor, matchStart)
            newChildren.push(before)
          }

          const html = new state.Token('html_inline', '', 0)
          html.content = `<TermTooltip term="${escapeAttr(matchedText)}" def="${escapeAttr(included.get(canonical)!)}" />`
          newChildren.push(html)

          cursor = matchStart + matchedText.length
        }

        if (!mutated) newChildren.push(child)
      }

      blockToken.children = newChildren
    }
  })
}
