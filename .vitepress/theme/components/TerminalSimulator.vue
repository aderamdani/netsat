<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'

const inputCommand = ref('')
const terminalOutput = ref<string[]>([
  '  MikroTik RouterOS 7.14 (c) 1999-2024       http://www.mikrotik.com/',
  '',
  '[admin@MikroTik] > '
])

const terminalRef = useTemplateRef<HTMLElement>('terminalRef')
const cmdInputRef = useTemplateRef<HTMLInputElement>('cmdInputRef')

const handleCommand = async () => {
  const cmd = inputCommand.value.trim().toLowerCase()
  const currentPrompt = '[admin@MikroTik] > '
  
  // echo the command
  terminalOutput.value[terminalOutput.value.length - 1] = currentPrompt + inputCommand.value
  inputCommand.value = ''
  
  if (cmd === 'ping 8.8.8.8') {
    terminalOutput.value.push('  SEQ HOST                                     SIZE TTL TIME  STATUS')
    terminalOutput.value.push('    0 8.8.8.8                                    56 116 34ms ')
    await new Promise(r => setTimeout(r, 600))
    terminalOutput.value.push('    1 8.8.8.8                                    56 116 32ms ')
    await new Promise(r => setTimeout(r, 600))
    terminalOutput.value.push('    2 8.8.8.8                                    56 116 35ms ')
    terminalOutput.value.push('    sent=3 received=3 packet-loss=0% min-rtt=32ms avg-rtt=33ms max-rtt=35ms')
  } else if (cmd === 'ip address print' || cmd === '/ip address print' || cmd === 'print ip') {
    terminalOutput.value.push('Flags: D - DYNAMIC; X - DISABLED, I - INVALID; L - LINK-LOCAL')
    terminalOutput.value.push('Columns: ADDRESS, NETWORK, INTERFACE')
    terminalOutput.value.push('#   ADDRESS            NETWORK         INTERFACE')
    terminalOutput.value.push('0   192.168.88.1/24    192.168.88.0    bridge   ')
    terminalOutput.value.push('1 D 10.10.10.25/24     10.10.10.0      ether1   ')
  } else if (cmd === 'clear') {
    terminalOutput.value = ['  MikroTik RouterOS 7.14 (c) 1999-2024       http://www.mikrotik.com/', '']
  } else if (cmd !== '') {
    terminalOutput.value.push(`bad command name ${cmd} (line 1 column 1)`)
  }
  
  terminalOutput.value.push(currentPrompt)
  
  await nextTick()
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight
  }
}

const focusInput = () => {
  if (cmdInputRef.value) {
    cmdInputRef.value.focus()
  }
}
</script>

<template>
  <div class="ns-terminal-wrapper">
    <div class="ns-terminal-header">
      <div class="mac-btns">
        <span class="mac-close"></span>
        <span class="mac-min"></span>
        <span class="mac-max"></span>
      </div>
      <div class="terminal-title">admin@MikroTik: ~</div>
    </div>
    <div class="ns-terminal-body" ref="terminalRef" @click="focusInput">
      <div class="terminal-line" v-for="(line, index) in terminalOutput.slice(0, -1)" :key="index" v-html="line.replace(/ /g, '&nbsp;')"></div>
      
      <div class="terminal-input-line">
        <span class="prompt">{{ terminalOutput[terminalOutput.length - 1] }}</span>
        <input 
          ref="cmdInputRef"
          v-model="inputCommand" 
          @keydown.enter="handleCommand"
          class="terminal-input" 
          type="text" 
          autocomplete="off"
          spellcheck="false"
          placeholder="Coba 'ping 8.8.8.8'"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ns-terminal-wrapper {
  margin: 48px auto;
  max-width: 720px;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  
  /* Scroll-driven animation reveal */
  animation: scroll-reveal linear both;
  animation-timeline: view();
  animation-range: entry 10% cover 25%;
}

@keyframes scroll-reveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Safe fallback for motion sensitive */
@media (prefers-reduced-motion: reduce) {
  .ns-terminal-wrapper {
    animation: none;
    transform: none !important;
  }
}

.ns-terminal-header {
  background: #2d2d2d;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  position: relative;
}

.mac-btns {
  display: flex;
  gap: 8px;
}
.mac-btns span {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.mac-close { background: #ff5f56; }
.mac-min { background: #ffbd2e; }
.mac-max { background: #27c93f; }

.terminal-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #999;
  font-family: var(--ns-font-mono);
  font-size: 12px;
}

.ns-terminal-body {
  padding: 16px;
  font-family: var(--ns-font-mono, monospace);
  font-size: 13px;
  line-height: 1.5;
  color: #10b981;
  height: 220px;
  overflow-y: auto;
  cursor: text;
}

.terminal-line {
  white-space: pre-wrap;
  word-break: break-all;
}

.terminal-input-line {
  display: flex;
  align-items: center;
}

.prompt {
  white-space: pre;
}

.terminal-input {
  background: transparent;
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  flex: 1;
}

.terminal-input::placeholder {
  color: #444;
}
</style>
