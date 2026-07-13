<script setup lang="ts">
import { ref, computed } from 'vue'

const ipInput = ref('192.0.2.130')
const prefix = ref(26)

const presets = [24, 25, 26, 27, 28, 29, 30]

function parseIp(value: string): number | null {
  const parts = value.trim().split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    const octet = Number(part)
    if (octet < 0 || octet > 255) return null
    n = (n << 8) | octet
  }
  return n >>> 0
}

function intToIp(n: number): string {
  return [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join('.')
}

function intToBinary(n: number): string {
  return (n >>> 0).toString(2).padStart(32, '0')
}

const ipInt = computed(() => parseIp(ipInput.value))
const isValid = computed(() => ipInt.value !== null)

const result = computed(() => {
  if (ipInt.value === null) return null
  const p = prefix.value
  const mask = p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0
  const wildcard = (~mask) >>> 0
  const network = (ipInt.value & mask) >>> 0
  const broadcast = (network | wildcard) >>> 0
  const totalAddresses = 2 ** (32 - p)

  let firstHost: number
  let lastHost: number
  let usableHosts: number
  if (p === 32) {
    firstHost = network
    lastHost = network
    usableHosts = 1
  } else if (p === 31) {
    // RFC 3021 — link point-to-point, kedua alamat dipakai
    firstHost = network
    lastHost = broadcast
    usableHosts = 2
  } else {
    firstHost = (network + 1) >>> 0
    lastHost = (broadcast - 1) >>> 0
    usableHosts = Math.max(totalAddresses - 2, 0)
  }

  return {
    mask: intToIp(mask),
    wildcard: intToIp(wildcard),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalAddresses,
    usableHosts,
    binary: intToBinary(ipInt.value),
  }
})
</script>

<template>
  <div class="ns-subnet-calc">
    <div class="ns-hint">💡 Ubah alamat IP dan panjang prefix — hasilnya dihitung langsung, tidak ada tombol "hitung"</div>

    <div class="ns-calc-inputs">
      <label class="ns-field-group">
        <span class="ns-field-label">Alamat IP</span>
        <input
          v-model="ipInput"
          type="text"
          inputmode="decimal"
          class="ns-ip-input"
          :class="{ 'is-error': !isValid }"
          spellcheck="false"
          aria-label="Alamat IP"
        />
      </label>
      <label class="ns-field-group">
        <span class="ns-field-label">Prefix /{{ prefix }}</span>
        <input
          v-model.number="prefix"
          type="range"
          min="0"
          max="32"
          class="ns-prefix-slider"
          aria-label="Panjang prefix CIDR"
        />
      </label>
    </div>

    <div class="ns-presets">
      <button
        v-for="p in presets"
        :key="p"
        type="button"
        class="ns-preset-btn"
        :class="{ active: prefix === p }"
        @click="prefix = p"
      >/{{ p }}</button>
    </div>

    <p v-if="!isValid" class="ns-error">
      Format IP tidak valid. Pakai empat oktet 0–255 dipisah titik, mis. <code>192.0.2.130</code>.
    </p>

    <template v-else-if="result">
      <div class="ns-bit-view" aria-hidden="true">
        <span
          v-for="(bit, i) in result.binary.split('')"
          :key="i"
          class="ns-bit"
          :class="i < prefix ? 'is-network' : 'is-host'"
        >{{ bit }}</span>
      </div>
      <div class="ns-bit-legend">
        <span><i class="ns-swatch is-network" /> {{ prefix }} bit jaringan</span>
        <span><i class="ns-swatch is-host" /> {{ 32 - prefix }} bit host</span>
      </div>

      <dl class="ns-result-grid">
        <div class="ns-result">
          <dt>Subnet mask</dt>
          <dd>{{ result.mask }}</dd>
        </div>
        <div class="ns-result">
          <dt>Wildcard mask</dt>
          <dd>{{ result.wildcard }}</dd>
        </div>
        <div class="ns-result">
          <dt>Network address</dt>
          <dd>{{ result.network }}</dd>
        </div>
        <div class="ns-result">
          <dt>Broadcast address</dt>
          <dd>{{ result.broadcast }}</dd>
        </div>
        <div class="ns-result">
          <dt>Rentang host</dt>
          <dd>{{ result.firstHost }} – {{ result.lastHost }}</dd>
        </div>
        <div class="ns-result">
          <dt>Host dipakai / total</dt>
          <dd>{{ result.usableHosts.toLocaleString('id-ID') }} / {{ result.totalAddresses.toLocaleString('id-ID') }}</dd>
        </div>
      </dl>
    </template>
  </div>
</template>

<style scoped>
.ns-subnet-calc {
  margin: 32px 0;
  font-family: var(--vp-font-family-base);
}

.ns-hint {
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 20px;
  font-style: italic;
}

.ns-calc-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 16px;
  align-items: end;
  max-width: 560px;
  margin: 0 auto;
}

.ns-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ns-field-label {
  font-family: var(--ns-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.ns-ip-input {
  font-family: var(--ns-font-mono);
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.ns-ip-input:focus-visible {
  outline: 2px solid var(--ns-gold);
  outline-offset: 1px;
}

.ns-ip-input.is-error {
  border-color: #d1425b;
}

.ns-prefix-slider {
  accent-color: var(--ns-gold);
  height: 36px;
}

.ns-presets {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin: 14px auto 0;
  max-width: 560px;
}

.ns-preset-btn {
  font-family: var(--ns-font-mono);
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 5px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s;
}

.ns-preset-btn:hover {
  border-color: var(--ns-gold);
  color: var(--ns-gold);
}

.ns-preset-btn.active {
  background: var(--ns-gold-soft);
  border-color: var(--ns-gold);
  color: var(--ns-gold-strong);
  font-weight: 600;
}

.ns-error {
  max-width: 560px;
  margin: 16px auto 0;
  text-align: center;
  font-size: 13.5px;
  color: #d1425b;
}

.ns-bit-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
  max-width: 560px;
  margin: 24px auto 0;
  font-family: var(--ns-font-mono);
  font-size: 13px;
}

.ns-bit {
  width: 16px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.ns-bit.is-network {
  background: var(--ns-gold-soft);
  color: var(--ns-gold-strong);
  font-weight: 700;
}

.ns-bit.is-host {
  color: var(--vp-c-text-3);
}

.ns-bit-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.ns-swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 5px;
  vertical-align: -1px;
}

.ns-swatch.is-network {
  background: var(--ns-gold);
}

.ns-swatch.is-host {
  background: var(--vp-c-divider);
}

.ns-result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px 24px;
  max-width: 700px;
  margin: 28px auto 0;
}

.ns-result dt {
  font-family: var(--ns-font-mono);
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}

.ns-result dd {
  margin: 4px 0 0;
  font-family: var(--ns-font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--ns-gold);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 600px) {
  .ns-calc-inputs {
    grid-template-columns: 1fr;
  }
}
</style>
