#!/usr/bin/env node
// Validasi bahwa tiga sumber data modul selalu 1:1: sidebar di
// .vitepress/config.ts, kartu topik di ModuleGrid.vue, dan berkas .md
// yang benar-benar ada di disk. Exit code 1 kalau ada yang tidak sinkron
// (dipakai di package.json "check:consistency" dan CI).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MODULES = ['networking', 'satelit', 'mikrotik', 'starlink']

function extractBracketBlock(text, startIndex) {
  const openIdx = text.indexOf('[', startIndex)
  let depth = 0
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '[') depth++
    else if (text[i] === ']') {
      depth--
      if (depth === 0) return text.slice(openIdx, i + 1)
    }
  }
  throw new Error(`Kurung tidak seimbang mulai dari index ${startIndex}`)
}

function linksInBlock(block, modulePrefix) {
  const re = new RegExp(`link:\\s*'(\\/${modulePrefix}\\/[^']*)'`, 'g')
  const links = new Set()
  let m
  while ((m = re.exec(block))) links.add(m[1])
  return links
}

function getSidebarLinks(configSrc, mod) {
  const keyMarker = `'/${mod}/': [`
  const idx = configSrc.indexOf(keyMarker)
  if (idx === -1) throw new Error(`Key sidebar '/${mod}/' tidak ditemukan di config.ts`)
  const block = extractBracketBlock(configSrc, idx)
  return linksInBlock(block, mod)
}

function getModuleGridLinks(gridSrc, mod, titleGuess) {
  const idx = gridSrc.indexOf(`title: '${titleGuess}'`)
  if (idx === -1) throw new Error(`title: '${titleGuess}' tidak ditemukan di ModuleGrid.vue`)
  const topicsIdx = gridSrc.indexOf('topics:', idx)
  const block = extractBracketBlock(gridSrc, topicsIdx)
  return linksInBlock(block, mod)
}

function getDiskLinks(mod) {
  const dir = path.join(root, mod)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  return new Set(
    files.map((f) => (f === 'index.md' ? `/${mod}/` : `/${mod}/${f.replace(/\.md$/, '')}`)),
  )
}

function diff(setA, setB) {
  return [...setA].filter((x) => !setB.has(x))
}

const configSrc = fs.readFileSync(path.join(root, '.vitepress/config.ts'), 'utf-8')
const gridSrc = fs.readFileSync(
  path.join(root, '.vitepress/theme/components/ModuleGrid.vue'),
  'utf-8',
)

const titleByModule = {
  networking: 'Networking',
  satelit: 'Satelit',
  mikrotik: 'MikroTik',
  starlink: 'Starlink',
}

let hasError = false

for (const mod of MODULES) {
  const sidebar = getSidebarLinks(configSrc, mod)
  const grid = getModuleGridLinks(gridSrc, mod, titleByModule[mod])
  const disk = getDiskLinks(mod)

  const problems = []
  const sidebarMinusGrid = diff(sidebar, grid)
  const gridMinusSidebar = diff(grid, sidebar)
  const sidebarMinusDisk = diff(sidebar, disk)
  const diskMinusSidebar = diff(disk, sidebar)

  if (sidebarMinusGrid.length) problems.push(`  sidebar punya, ModuleGrid tidak: ${sidebarMinusGrid.join(', ')}`)
  if (gridMinusSidebar.length) problems.push(`  ModuleGrid punya, sidebar tidak: ${gridMinusSidebar.join(', ')}`)
  if (sidebarMinusDisk.length) problems.push(`  sidebar punya, file tidak ada di disk: ${sidebarMinusDisk.join(', ')}`)
  if (diskMinusSidebar.length) problems.push(`  file ada di disk, sidebar tidak: ${diskMinusSidebar.join(', ')}`)

  if (problems.length) {
    hasError = true
    console.error(`\n[${mod}] TIDAK SINKRON:`)
    console.error(problems.join('\n'))
  } else {
    console.log(`[${mod}] OK — ${disk.size} halaman, sidebar/ModuleGrid/disk sinkron.`)
  }
}

if (hasError) {
  console.error('\nGagal: sidebar config.ts, ModuleGrid.vue, dan file di disk tidak 1:1. Perbaiki sebelum lanjut.')
  process.exit(1)
} else {
  console.log('\nSemua modul konsisten.')
}
