<script setup lang="ts">
import {
  ArrowRight,
  Layers,
  Network,
  Route,
  Split,
  Binary,
  Waypoints,
  ShieldCheck,
  Orbit,
  Satellite,
  RadioTower,
  Antenna,
  AudioWaveform,
  SatelliteDish,
} from '@lucide/vue'

const modules = [
  {
    code: 'MODUL 01',
    title: 'Networking',
    desc: 'Fondasi jaringan komputer: bagaimana data dipecah, dialamatkan, diarahkan, dan diamankan dari satu mesin ke mesin lain.',
    link: '/networking/',
    topics: [
      { icon: Layers, text: 'Model OSI & TCP/IP', link: '/networking/model-osi' },
      { icon: Binary, text: 'IP Addressing & Subnetting', link: '/networking/subnetting' },
      { icon: Route, text: 'Routing', link: '/networking/routing' },
      { icon: Split, text: 'Switching & VLAN', link: '/networking/switching' },
      { icon: Waypoints, text: 'Protokol Jaringan', link: '/networking/protokol' },
      { icon: ShieldCheck, text: 'Keamanan Jaringan', link: '/networking/keamanan' },
    ],
  },
  {
    code: 'MODUL 02',
    title: 'Satelit',
    desc: 'Komunikasi lewat angkasa: jenis orbit, cara sinyal naik-turun 36 ribu kilometer, dan infrastruktur bumi yang menopangnya.',
    link: '/satelit/',
    topics: [
      { icon: Orbit, text: 'Orbit: LEO, MEO, GEO', link: '/satelit/orbit' },
      { icon: Satellite, text: 'Komunikasi Satelit', link: '/satelit/komunikasi' },
      { icon: RadioTower, text: 'Ground Station', link: '/satelit/ground-station' },
      { icon: AudioWaveform, text: 'Frekuensi & Band', link: '/satelit/frekuensi-band' },
      { icon: SatelliteDish, text: 'VSAT', link: '/satelit/vsat' },
      { icon: Antenna, text: 'Pengantar Satelit', link: '/satelit/' },
    ],
  },
]
</script>

<template>
  <section class="ns-modules">
    <article v-for="m in modules" :key="m.code" class="ns-module">
      <header class="ns-module-head">
        <p class="ns-eyebrow">{{ m.code }}</p>
        <h2 class="ns-module-title">{{ m.title }}</h2>
        <p class="ns-module-desc">{{ m.desc }}</p>
      </header>
      <ul class="ns-topic-list">
        <li v-for="t in m.topics" :key="t.text">
          <a :href="t.link" class="ns-topic">
            <component :is="t.icon" :size="16" class="ns-topic-icon" aria-hidden="true" />
            <span>{{ t.text }}</span>
          </a>
        </li>
      </ul>
      <a :href="m.link" class="ns-module-link">
        Buka modul {{ m.title }}
        <ArrowRight :size="15" aria-hidden="true" />
      </a>
    </article>
  </section>
</template>

<style scoped>
.ns-modules {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  padding: 40px 0 8px;
}

.ns-module {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 28px 28px 24px;
  background: var(--vp-c-bg-elv);
}

.ns-module-title {
  font-family: var(--ns-font-display);
  font-size: 1.5rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  margin: 10px 0 0;
  border: none;
  padding: 0;
}

.ns-module-desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.ns-topic-list {
  list-style: none;
  margin: 22px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 16px;
}

.ns-topic {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 8px;
  margin-left: -8px;
  border-radius: 5px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s, color 0.15s;
}

.ns-topic:hover {
  background: var(--ns-gold-soft);
  color: var(--ns-gold);
}

.ns-topic-icon {
  flex-shrink: 0;
  color: var(--ns-gold);
}

.ns-module-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: auto;
  padding-top: 22px;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ns-gold);
}

.ns-module-link:hover {
  color: var(--ns-gold-strong);
}

@media (max-width: 720px) {
  .ns-modules {
    grid-template-columns: 1fr;
  }

  .ns-topic-list {
    grid-template-columns: 1fr;
  }
}
</style>
