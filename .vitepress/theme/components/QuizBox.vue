<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle2, XCircle } from '@lucide/vue'

const props = defineProps<{
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}>()

const selectedIndex = ref<number | null>(null)
const isSubmitted = ref(false)

const selectOption = (index: number) => {
  if (isSubmitted.value) return
  selectedIndex.value = index
}

const submit = () => {
  if (selectedIndex.value === null) return
  isSubmitted.value = true
}

const reset = () => {
  selectedIndex.value = null
  isSubmitted.value = false
}
</script>

<template>
  <div class="ns-quiz">
    <div class="ns-quiz-q">
      <strong>Tes Pengetahuan:</strong> {{ question }}
    </div>
    
    <div class="ns-quiz-options">
      <button
        v-for="(opt, idx) in options"
        :key="idx"
        class="ns-quiz-btn"
        :class="{
          'is-selected': selectedIndex === idx && !isSubmitted,
          'is-correct': isSubmitted && idx === correctIndex,
          'is-wrong': isSubmitted && selectedIndex === idx && idx !== correctIndex,
          'is-disabled': isSubmitted
        }"
        @click="selectOption(idx)"
        :disabled="isSubmitted"
      >
        <span class="ns-quiz-idx">{{ String.fromCharCode(65 + idx) }}</span>
        <span class="ns-quiz-text">{{ opt }}</span>
        
        <CheckCircle2 v-if="isSubmitted && idx === correctIndex" class="ns-quiz-icon ns-icon-correct" :size="18" />
        <XCircle v-if="isSubmitted && selectedIndex === idx && idx !== correctIndex" class="ns-quiz-icon ns-icon-wrong" :size="18" />
      </button>
    </div>

    <div class="ns-quiz-actions" v-if="!isSubmitted">
      <button 
        class="ns-quiz-submit" 
        :disabled="selectedIndex === null"
        @click="submit"
      >
        Periksa Jawaban
      </button>
    </div>

    <div class="ns-quiz-feedback" v-if="isSubmitted" :class="selectedIndex === correctIndex ? 'feedback-correct' : 'feedback-wrong'">
      <p class="ns-feedback-title">
        <span v-if="selectedIndex === correctIndex">✅ Tepat Sekali!</span>
        <span v-else>❌ Masih Kurang Tepat</span>
      </p>
      <p class="ns-feedback-desc" v-if="explanation">{{ explanation }}</p>
      <button class="ns-quiz-reset" @click="reset" v-if="selectedIndex !== correctIndex">
        Coba Lagi
      </button>
    </div>
  </div>
</template>

<style scoped>
.ns-quiz {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 20px;
  margin: 24px 0;
  background: var(--vp-c-bg-soft);
}

.ns-quiz-q {
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--vp-c-text-1);
}

.ns-quiz-q strong {
  color: var(--vp-c-brand-1);
}

.ns-quiz-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ns-quiz-btn {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.2s ease;
  cursor: pointer;
  color: var(--vp-c-text-1);
}

.ns-quiz-btn:not(.is-disabled):hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.ns-quiz-btn.is-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.ns-quiz-btn.is-correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.ns-quiz-btn.is-wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.ns-quiz-btn.is-disabled {
  cursor: default;
  opacity: 0.8;
}

.ns-quiz-idx {
  font-family: var(--ns-font-mono);
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-right: 12px;
  font-size: 14px;
}

.ns-quiz-btn.is-correct .ns-quiz-idx { color: #10b981; }
.ns-quiz-btn.is-wrong .ns-quiz-idx { color: #ef4444; }

.ns-quiz-text {
  flex: 1;
  font-size: 15px;
}

.ns-quiz-icon {
  margin-left: 12px;
}

.ns-icon-correct { color: #10b981; }
.ns-icon-wrong { color: #ef4444; }

.ns-quiz-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.ns-quiz-submit {
  background: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: 1px solid var(--vp-button-brand-border);
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.ns-quiz-submit:hover:not(:disabled) {
  background: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
}

.ns-quiz-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ns-quiz-feedback {
  margin-top: 16px;
  padding: 16px;
  border-radius: 6px;
  animation: fade-in 0.3s ease;
}

.feedback-correct {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.feedback-wrong {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.ns-feedback-title {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 15px;
}

.feedback-correct .ns-feedback-title { color: #10b981; }
.feedback-wrong .ns-feedback-title { color: #ef4444; }

.ns-feedback-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.ns-quiz-reset {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
}

.ns-quiz-reset:hover {
  color: var(--vp-c-text-1);
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
