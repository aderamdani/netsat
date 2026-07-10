<script setup lang="ts">
const readouts = [
  { label: 'LAPISAN OSI', value: '7' },
  { label: 'ALAMAT IPv4', value: '2³²' },
  { label: 'ALTITUDE GEO', value: '35.786 km' },
  { label: 'LATENSI GEO (RTT)', value: '≈ 500 ms' },
  { label: 'KECEPATAN ORBIT LEO', value: '≈ 7,8 km/s' },
  { label: 'BAND Ku UPLINK', value: '14 GHz' },
]
</script>

<template>
  <section class="ns-telemetry" aria-label="Angka-angka kunci">
    <dl class="ns-telemetry-row">
      <div v-for="r in readouts" :key="r.label" class="ns-readout">
        <dt>{{ r.label }}</dt>
        <dd>{{ r.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.ns-telemetry {
  margin: 36px 0 8px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 18px 0;
}

.ns-telemetry-row {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 40px;
  margin: 0;
}

.ns-readout dt {
  font-family: var(--ns-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.14em;
  color: var(--vp-c-text-3);
}

.ns-readout dd {
  margin: 3px 0 0;
  font-family: var(--ns-font-mono);
  font-size: 15px;
  font-weight: 500;
  color: var(--ns-gold);
  font-variant-numeric: tabular-nums;
}
</style>
