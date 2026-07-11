<script setup lang="ts">
import { useData } from 'vitepress'
import { useSidebar } from 'vitepress/theme'
import DefaultTheme from 'vitepress/theme'
import { ref, onMounted } from 'vue'
import { PanelLeft, PanelLeftClose } from '@lucide/vue'

const { Layout } = DefaultTheme
const { hasSidebar } = useSidebar()

const isSidebarHidden = ref(false)

const toggleSidebar = () => {
  isSidebarHidden.value = !isSidebarHidden.value
  if (isSidebarHidden.value) {
    document.documentElement.classList.add('hide-sidebar')
    localStorage.setItem('vitepress-hide-sidebar', 'true')
  } else {
    document.documentElement.classList.remove('hide-sidebar')
    localStorage.setItem('vitepress-hide-sidebar', 'false')
  }
}

onMounted(() => {
  const isHidden = localStorage.getItem('vitepress-hide-sidebar') === 'true'
  if (isHidden) {
    isSidebarHidden.value = true
    document.documentElement.classList.add('hide-sidebar')
  }
})
</script>

<template>
  <Layout>
    <template #nav-bar-content-before>
      <button 
        class="sidebar-toggle-btn" 
        @click="toggleSidebar" 
        :title="isSidebarHidden ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar'"
        v-if="hasSidebar"
      >
        <PanelLeft v-if="isSidebarHidden" :size="20" :stroke-width="1.5" />
        <PanelLeftClose v-else :size="20" :stroke-width="1.5" />
      </button>
    </template>
  </Layout>
</template>

<style scoped>
.sidebar-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  margin-right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.sidebar-toggle-btn:hover {
  color: var(--vp-c-text-1);
}

@media (max-width: 959px) {
  .sidebar-toggle-btn {
    display: none;
  }
}
</style>
