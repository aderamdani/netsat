<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let particles: Particle[] = []
let animationFrameId = 0
let width = 0
let height = 0

const mouse = { x: -1000, y: -1000 }

class Particle {
  x: number
  y: number
  vx: number
  vy: number
  
  constructor(w: number, h: number) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = (Math.random() - 0.5) * 0.4
  }
  
  update() {
    this.x += this.vx
    this.y += this.vy
    
    if (this.x < 0 || this.x > width) this.vx *= -1
    if (this.y < 0 || this.y > height) this.vy *= -1
  }
}

const resize = () => {
  if (!canvasRef.value) return
  const parent = canvasRef.value.parentElement
  width = parent?.clientWidth || window.innerWidth
  height = parent?.clientHeight || window.innerHeight
  canvasRef.value.width = width
  canvasRef.value.height = height
  
  // Re-init particles based on screen size (less dense on mobile)
  const density = window.innerWidth < 768 ? 20000 : 12000
  const numParticles = Math.min(Math.floor((width * height) / density), 80)
  particles = Array.from({ length: numParticles }, () => new Particle(width, height))
}

const render = () => {
  if (!ctx || !canvasRef.value) return
  
  ctx.clearRect(0, 0, width, height)
  
  // Warna garis dasar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.update()
    
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
    ctx.fill()
    
    // Connect nearby particles
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j]
      const dx = p.x - p2.x
      const dy = p.y - p2.y
      const distSq = dx * dx + dy * dy
      
      if (distSq < 10000) {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    }
    
    // Connect to mouse (Golden mesh effect)
    const dxm = p.x - mouse.x
    const dym = p.y - mouse.y
    const distSqMouse = dxm * dxm + dym * dym
    if (distSqMouse < 25000) {
      ctx.beginPath()
      // e.g. gold color var(--ns-gold) roughly rgba(212, 175, 55, ...)
      ctx.strokeStyle = `rgba(212, 175, 55, ${0.4 * (1 - distSqMouse / 25000)})` 
      ctx.lineWidth = 1.5
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(mouse.x, mouse.y)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)' // Reset
      ctx.lineWidth = 1
    }
  }
  
  animationFrameId = requestAnimationFrame(render)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  
  // Check bounds so it only reacts when mouse is inside the hero area
  if (
    e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom
  ) {
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  } else {
    mouse.x = -1000
    mouse.y = -1000
  }
}

onMounted(() => {
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  
  ctx = canvasRef.value?.getContext('2d') || null
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', handleMouseMove)
  render()
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <canvas 
    ref="canvasRef" 
    class="ns-particle-network"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.ns-particle-network {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Let clicks pass through to buttons */
  z-index: 0;
}
</style>
