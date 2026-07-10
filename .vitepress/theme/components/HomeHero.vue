<script setup lang="ts">
import { ArrowRight, BookOpen } from '@lucide/vue'
</script>

<template>
  <section class="ns-hero">
    <div class="ns-hero-text">
      <p class="ns-eyebrow">LINK ▸ ESTABLISHED — DOKUMENTASI TERBUKA</p>
      <h1 class="ns-hero-title">
        Dari kabel di lantai satu<br class="ns-hero-br" />
        sampai orbit <span class="ns-hero-geo">35.786&nbsp;km</span>.
      </h1>
      <p class="ns-hero-desc">
        NetSat adalah dokumentasi belajar jaringan komputer dan komunikasi
        satelit dalam bahasa Indonesia — ditulis runtut dari model OSI,
        subnetting, dan routing, hingga orbit LEO/MEO/GEO, ground station,
        dan VSAT.
      </p>
      <div class="ns-hero-actions">
        <a class="ns-btn ns-btn-solid" href="/networking/">
          <BookOpen :size="16" aria-hidden="true" />
          Mulai dari Networking
        </a>
        <a class="ns-btn ns-btn-ghost" href="/satelit/">
          Langsung ke Satelit
          <ArrowRight :size="16" aria-hidden="true" />
        </a>
      </div>
    </div>

    <!-- diagram orbit: LEO / MEO / GEO mengelilingi Bumi -->
    <div class="ns-hero-orbit ns-orbit-anim" aria-hidden="true">
      <svg viewBox="0 0 420 420" class="ns-orbit-svg">
        <!-- cincin orbit -->
        <circle cx="210" cy="210" r="88" class="ns-ring" />
        <circle cx="210" cy="210" r="138" class="ns-ring" />
        <circle cx="210" cy="210" r="192" class="ns-ring ns-ring-geo" />

        <!-- bumi -->
        <circle cx="210" cy="210" r="46" class="ns-earth" />
        <path
          d="M175 195 q20 -14 38 -4 q16 9 30 2 M172 220 q24 10 44 4 q18 -5 36 4 M186 244 q18 8 40 2"
          class="ns-earth-line"
        />

        <!-- satelit di tiap orbit -->
        <g class="ns-sat ns-sat-leo">
          <g transform="translate(210 122)">
            <rect x="-4" y="-4" width="8" height="8" class="ns-sat-body" />
            <rect x="-14" y="-2.4" width="8" height="4.8" class="ns-sat-panel" />
            <rect x="6" y="-2.4" width="8" height="4.8" class="ns-sat-panel" />
          </g>
        </g>
        <g class="ns-sat ns-sat-meo">
          <g transform="translate(210 72)">
            <rect x="-4" y="-4" width="8" height="8" class="ns-sat-body" />
            <rect x="-14" y="-2.4" width="8" height="4.8" class="ns-sat-panel" />
            <rect x="6" y="-2.4" width="8" height="4.8" class="ns-sat-panel" />
          </g>
        </g>
        <g class="ns-sat ns-sat-geo">
          <g transform="translate(210 18)">
            <rect x="-5" y="-5" width="10" height="10" class="ns-sat-body" />
            <rect x="-17" y="-3" width="10" height="6" class="ns-sat-panel" />
            <rect x="7" y="-3" width="10" height="6" class="ns-sat-panel" />
          </g>
        </g>
      </svg>
      <div class="ns-orbit-labels">
        <span>LEO&nbsp;·&nbsp;&lt;2.000&nbsp;km</span>
        <span>MEO&nbsp;·&nbsp;~20.200&nbsp;km</span>
        <span>GEO&nbsp;·&nbsp;35.786&nbsp;km</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ns-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 48px;
  align-items: center;
  padding: 56px 0 24px;
}

.ns-hero-title {
  font-family: var(--ns-font-display);
  font-size: clamp(2rem, 4.6vw, 3.3rem);
  font-weight: 680;
  line-height: 1.08;
  letter-spacing: -0.02em;
  margin: 18px 0 0;
  color: var(--vp-c-text-1);
}

.ns-hero-geo {
  color: var(--ns-gold);
  font-variant-numeric: tabular-nums;
}

.ns-hero-desc {
  margin: 20px 0 0;
  max-width: 52ch;
  font-size: 16px;
  line-height: 1.75;
  color: var(--vp-c-text-2);
}

.ns-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.ns-btn {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.ns-btn-solid {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
}

.ns-btn-solid:hover {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-border);
}

.ns-btn-ghost {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.ns-btn-ghost:hover {
  border-color: var(--ns-gold);
  color: var(--ns-gold);
}

/* ---- diagram orbit ---- */

.ns-hero-orbit {
  position: relative;
  min-width: 0;
}

.ns-orbit-svg {
  width: 100%;
  height: auto;
  display: block;
}

.ns-ring {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}

.ns-ring-geo {
  stroke-dasharray: 3 5;
}

.ns-earth {
  fill: var(--vp-c-bg-soft);
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
}

.ns-earth-line {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
  opacity: 0.55;
}

.ns-sat-body {
  fill: var(--ns-gold);
}

.ns-sat-panel {
  fill: none;
  stroke: var(--ns-gold);
  stroke-width: 1;
}

.ns-sat {
  transform-origin: 210px 210px;
}

/* kecepatan orbit mengikuti fisika: makin rendah makin cepat;
   delay negatif menyebar posisi awal agar tidak menumpuk */
.ns-sat-leo {
  animation: ns-orbit 14s linear infinite;
  animation-delay: -3s;
}

.ns-sat-meo {
  animation: ns-orbit 34s linear infinite;
  animation-delay: -21s;
}

.ns-sat-geo {
  animation: ns-orbit 80s linear infinite;
  animation-delay: -52s;
}

@keyframes ns-orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ns-orbit-labels {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 10px;
  font-family: var(--ns-font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
}

@media (max-width: 560px) {
  .ns-hero-br {
    display: none;
  }
}

@media (max-width: 860px) {
  .ns-hero {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-top: 36px;
  }

  .ns-hero-orbit {
    max-width: 340px;
    margin: 0 auto;
  }
}
</style>
