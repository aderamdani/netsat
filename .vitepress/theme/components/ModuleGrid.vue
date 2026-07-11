<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ArrowRight,
  Layers,
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
  KeyRound,
  EthernetPort,
  ArrowLeftRight,
  BrickWall,
  Lock,
  Wifi,
  BookOpen,
  Network,
  Cpu,
  Package,
  Sliders,
  AlertTriangle,
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
  {
    code: 'MODUL 03',
    title: 'MikroTik',
    desc: 'Modul praktik: teori dua modul sebelumnya diterjemahkan menjadi konfigurasi nyata di RouterOS, baris demi baris.',
    link: '/mikrotik/',
    topics: [
      { icon: KeyRound, text: 'Akses Awal & Keamanan', link: '/mikrotik/akses-awal' },
      { icon: EthernetPort, text: 'Interface & IP Address', link: '/mikrotik/interface-ip' },
      { icon: ArrowLeftRight, text: 'DHCP, DNS & NAT', link: '/mikrotik/dhcp-dns-nat' },
      { icon: BrickWall, text: 'Firewall & QoS', link: '/mikrotik/firewall-qos' },
      { icon: Lock, text: 'VPN', link: '/mikrotik/vpn' },
      { icon: Wifi, text: 'Wireless & Satelit', link: '/mikrotik/wireless-dan-satelit' },
    ],
  },
  {
    code: 'MODUL 04',
    title: 'Starlink',
    desc: 'Teknologi satelit LEO SpaceX: dari arsitektur laser luar angkasa, hardware dish, jenis paket, hingga praktik integrasi RouterOS.',
    link: '/starlink/',
    topics: [
      { icon: BookOpen, text: 'Pengantar Starlink', link: '/starlink/' },
      { icon: Network, text: 'Arsitektur Jaringan', link: '/starlink/arsitektur' },
      { icon: Cpu, text: 'Perangkat Keras & PoE', link: '/starlink/hardware' },
      { icon: Package, text: 'Jenis Layanan & Paket', link: '/starlink/layanan' },
      { icon: Sliders, text: 'Integrasi RouterOS', link: '/starlink/praktik-mikrotik' },
      { icon: AlertTriangle, text: 'Troubleshooting & Diagnostik', link: '/starlink/troubleshooting' },
    ],
  },
]

const moduleRefs = ref<HTMLElement[]>([])

onMounted(() => {
  moduleRefs.value.forEach((card) => {
    if (!card) return
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      
      // Calculate rotation for 3D tilt
      const rotateX = ((y - centerY) / centerY) * -4
      const rotateY = ((x - centerX) / centerX) * 4
      
      card.style.setProperty('--mouse-x', `${x}px`)
      card.style.setProperty('--mouse-y', `${y}px`)
      card.style.setProperty('--rotate-x', `${rotateX}deg`)
      card.style.setProperty('--rotate-y', `${rotateY}deg`)
    })
    
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--rotate-x', `0deg`)
      card.style.setProperty('--rotate-y', `0deg`)
    })
  })
})
</script>

<template>
  <section class="ns-modules">
    <article 
      v-for="m in modules" 
      :key="m.code" 
      class="ns-module"
      ref="moduleRefs"
    >
      <div class="ns-module-glow" aria-hidden="true"></div>
      <div class="ns-module-content">
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
      </div>
    </article>
  </section>
</template>

<style scoped>
@property --inner-size {
  syntax: "<length-percentage>";
  inherits: true;
  initial-value: 0px;
}
@property --outer-size {
  syntax: "<length-percentage>";
  inherits: true;
  initial-value: 0px;
}

.ns-modules {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  padding: 40px 0 8px;
}

.ns-module {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: var(--vp-c-bg-elv);
  
  /* 3D Tilt properties */
  transform: perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg));
  transition: transform 0.15s ease-out;
  transform-style: preserve-3d;
  will-change: transform;
  
  /* Scroll-driven animation reveal */
  animation: scroll-reveal linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 25%;
}

@keyframes scroll-reveal {
  from {
    opacity: 0;
    transform: perspective(1000px) translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: perspective(1000px) translateY(0) scale(1);
  }
}

/* Safe fallback for motion sensitive */
@media (prefers-reduced-motion: reduce) {
  .ns-module {
    animation: none;
    transform: none !important;
    transition: none !important;
  }
}

.ns-module::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid var(--vp-c-divider);
  pointer-events: none;
  z-index: 2;
}

.ns-module-content {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 28px 28px 24px;
  flex: 1;
  z-index: 3;
}

/* Interactive Glow Spotlight */
.ns-module-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--ns-gold-soft);
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s;
  
  /* mask */
  mask-image: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    black var(--inner-size, 0%),
    transparent var(--outer-size, 0%)
  );
  -webkit-mask-image: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    black var(--inner-size, 0%),
    transparent var(--outer-size, 0%)
  );
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
}

.ns-module:hover .ns-module-glow {
  opacity: 1;
  /* Instead of transitioning the properties because it can cause lag if done wrong,
     we just set them on hover statically large enough to glow */
  --inner-size: 50px;
  --outer-size: 150px;
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
  grid-template-columns: 1fr;
  gap: 4px 16px;
}

.ns-topic {
  text-decoration: none;
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
  text-decoration: none;
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

@media (max-width: 1200px) {
  .ns-modules {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .ns-modules {
    grid-template-columns: 1fr;
  }
  .ns-module {
    /* turn off scroll animation for mobile to be safe */
    animation: none;
  }
}
</style>
