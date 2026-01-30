'use client'

import { useEffect, useRef, useState } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  layer: number
}

interface Detection {
  x: number
  y: number
  width: number
  height: number
  confidence: number
  label: string
  color: string
  text?: string
}

// 요소 타입별 색상 및 라벨
const ELEMENT_CONFIG: Record<string, { label: string; color: string }> = {
  'h1': { label: 'heading_1', color: '#ef4444' },
  'h2': { label: 'heading_2', color: '#f97316' },
  'h3': { label: 'heading_3', color: '#f59e0b' },
  'h4': { label: 'heading_4', color: '#eab308' },
  'a': { label: 'link', color: '#06b6d4' },
  'button': { label: 'button', color: '#8b5cf6' },
  'input': { label: 'input_field', color: '#ec4899' },
  'textarea': { label: 'text_area', color: '#ec4899' },
  'img': { label: 'image', color: '#10b981' },
  'video': { label: 'video', color: '#14b8a6' },
  'p': { label: 'paragraph', color: '#6366f1' },
  'span': { label: 'text_span', color: '#a855f7' },
  'div': { label: 'container', color: '#64748b' },
  'li': { label: 'list_item', color: '#0ea5e9' },
  'nav': { label: 'navigation', color: '#f43f5e' },
  'section': { label: 'section', color: '#7c3aed' },
  'article': { label: 'article', color: '#2563eb' },
  'footer': { label: 'footer', color: '#475569' },
  'header': { label: 'header', color: '#dc2626' },
  'svg': { label: 'icon', color: '#84cc16' },
  'path': { label: 'icon', color: '#84cc16' },
  'code': { label: 'code_block', color: '#22c55e' },
  'pre': { label: 'code_block', color: '#22c55e' },
}

const DEFAULT_CONFIG = { label: 'element', color: '#94a3b8' }

function getElementInfo(element: Element | null, canvasRect?: DOMRect): Detection | null {
  if (!element || element.tagName === 'CANVAS' || element.tagName === 'HTML' || element.tagName === 'BODY') {
    return null
  }

  const rect = element.getBoundingClientRect()

  // 너무 작거나 화면 밖 요소 무시
  if (rect.width < 10 || rect.height < 10 || rect.width > window.innerWidth * 0.9) {
    return null
  }

  // 캔버스 오프셋 보정
  const offsetX = canvasRect ? canvasRect.left : 0
  const offsetY = canvasRect ? canvasRect.top : 0

  const tagName = element.tagName.toLowerCase()
  const config = ELEMENT_CONFIG[tagName] || DEFAULT_CONFIG

  // 텍스트 내용 추출 (첫 30자까지)
  let textContent = ''
  if (element.textContent) {
    textContent = element.textContent.trim().slice(0, 30)
    if (element.textContent.trim().length > 30) {
      textContent += '...'
    }
  }

  // 특수 속성 확인
  const ariaLabel = element.getAttribute('aria-label')
  const alt = element.getAttribute('alt')
  const placeholder = element.getAttribute('placeholder')
  const title = element.getAttribute('title')

  const displayText = textContent || ariaLabel || alt || placeholder || title || ''

  // 신뢰도 계산 (텍스트가 있으면 높음, 의미있는 태그면 높음)
  let confidence = 0.6
  if (displayText) confidence += 0.2
  if (['h1', 'h2', 'h3', 'a', 'button', 'input', 'img'].includes(tagName)) confidence += 0.15
  if (element.id || element.className) confidence += 0.05
  confidence = Math.min(confidence, 0.99)

  return {
    x: rect.left - offsetX,
    y: rect.top - offsetY,
    width: rect.width,
    height: rect.height,
    confidence,
    label: config.label,
    color: config.color,
    text: displayText,
  }
}

export function CVBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 })
  const nodesRef = useRef<Node[]>([])
  const currentDetectionRef = useRef<Detection | null>(null)
  const frameRef = useRef<number>(0)
  const lastDetectionTimeRef = useRef<number>(0)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    const handleScroll = () => {
      // 첫 번째 뷰포트 높이 (히어로 섹션) 내에서만 표시
      const scrollThreshold = window.innerHeight * 0.3 // 30% 스크롤하면 숨김
      setIsVisible(window.scrollY < scrollThreshold)
    }

    updateDimensions()
    handleScroll()
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('resize', updateDimensions)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (dimensions.width === 0) return

    // Initialize nodes (neural network particles)
    const nodeCount = Math.floor((dimensions.width * dimensions.height) / 15000)
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      layer: Math.floor(Math.random() * 3),
    }))
  }, [dimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.prevX = mouseRef.current.x
      mouseRef.current.prevY = mouseRef.current.y
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY

      // 실제 DOM 요소 감지 (쓰로틀링 적용)
      const now = Date.now()
      if (now - lastDetectionTimeRef.current > 100) {
        lastDetectionTimeRef.current = now

        // 캔버스 위치 저장
        const canvasRect = canvas.getBoundingClientRect()

        // 캔버스를 일시적으로 숨겨서 아래 요소 감지
        canvas.style.display = 'none'
        const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY)
        canvas.style.display = 'block'

        currentDetectionRef.current = getElementInfo(elementAtPoint, canvasRect)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height)

      const nodes = nodesRef.current
      const mouse = mouseRef.current
      const detection = currentDetectionRef.current

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        if (node.x < 0 || node.x > dimensions.width) node.vx *= -1
        if (node.y < 0 || node.y > dimensions.height) node.vy *= -1

        // Mouse attraction (subtle)
        const dx = mouse.x - node.x
        const dy = mouse.y - node.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200 && dist > 0) {
          node.vx += (dx / dist) * 0.02
          node.vy += (dy / dist) * 0.02
        }

        // Limit velocity
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
        if (speed > 1) {
          node.vx = (node.vx / speed) * 1
          node.vy = (node.vy / speed) * 1
        }

        // Draw node
        const alpha = 0.3 + node.layer * 0.2
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha})`
        ctx.fill()

        // Draw connections to nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const d = Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })

      // Draw feature flow lines from mouse
      const flowCount = 8
      for (let i = 0; i < flowCount; i++) {
        const angle = (Math.PI * 2 * i) / flowCount + frameRef.current * 0.01
        const length = 30 + Math.sin(frameRef.current * 0.05 + i) * 15

        ctx.beginPath()
        ctx.moveTo(mouse.x, mouse.y)
        ctx.lineTo(
          mouse.x + Math.cos(angle) * length,
          mouse.y + Math.sin(angle) * length
        )
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(frameRef.current * 0.1 + i) * 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw detection box for current element
      if (detection) {
        const det = detection

        // Bounding box - solid line
        ctx.strokeStyle = det.color
        ctx.lineWidth = 2
        ctx.strokeRect(det.x, det.y, det.width, det.height)

        // Corner brackets - thicker and more visible
        const bracketSize = Math.min(20, det.width / 4, det.height / 4)
        ctx.lineWidth = 3
        ctx.strokeStyle = det.color

        // Top-left
        ctx.beginPath()
        ctx.moveTo(det.x, det.y + bracketSize)
        ctx.lineTo(det.x, det.y)
        ctx.lineTo(det.x + bracketSize, det.y)
        ctx.stroke()

        // Top-right
        ctx.beginPath()
        ctx.moveTo(det.x + det.width - bracketSize, det.y)
        ctx.lineTo(det.x + det.width, det.y)
        ctx.lineTo(det.x + det.width, det.y + bracketSize)
        ctx.stroke()

        // Bottom-left
        ctx.beginPath()
        ctx.moveTo(det.x, det.y + det.height - bracketSize)
        ctx.lineTo(det.x, det.y + det.height)
        ctx.lineTo(det.x + bracketSize, det.y + det.height)
        ctx.stroke()

        // Bottom-right
        ctx.beginPath()
        ctx.moveTo(det.x + det.width - bracketSize, det.y + det.height)
        ctx.lineTo(det.x + det.width, det.y + det.height)
        ctx.lineTo(det.x + det.width, det.y + det.height - bracketSize)
        ctx.stroke()

        // Label background
        const confidenceText = `${(det.confidence * 100).toFixed(0)}%`
        const labelText = det.text
          ? `${det.label}: "${det.text}" ${confidenceText}`
          : `${det.label} ${confidenceText}`

        ctx.font = 'bold 13px monospace'
        const textWidth = ctx.measureText(labelText).width
        const labelHeight = 22
        const labelPadding = 8

        // Solid background for better readability
        ctx.fillStyle = det.color
        ctx.fillRect(det.x, det.y - labelHeight - 4, textWidth + labelPadding * 2, labelHeight)

        // Label text
        ctx.fillStyle = '#ffffff'
        ctx.fillText(labelText, det.x + labelPadding, det.y - 10)
      }

      // Heatmap effect around mouse
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 100
      )
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)')
      gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.05)')
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2)
      ctx.fill()

      // Tracking line (motion trail)
      if (mouse.prevX && mouse.prevY) {
        const trailDist = Math.sqrt(
          (mouse.x - mouse.prevX) ** 2 + (mouse.y - mouse.prevY) ** 2
        )
        if (trailDist > 2) {
          ctx.beginPath()
          ctx.moveTo(mouse.prevX, mouse.prevY)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)'
          ctx.lineWidth = 2
          ctx.stroke()

          // Velocity vector
          const vx = (mouse.x - mouse.prevX) * 2
          const vy = (mouse.y - mouse.prevY) * 2
          ctx.beginPath()
          ctx.moveTo(mouse.x, mouse.y)
          ctx.lineTo(mouse.x + vx, mouse.y + vy)
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)'
          ctx.lineWidth = 1
          ctx.stroke()

          // Arrow head
          const angle = Math.atan2(vy, vx)
          ctx.beginPath()
          ctx.moveTo(mouse.x + vx, mouse.y + vy)
          ctx.lineTo(
            mouse.x + vx - 8 * Math.cos(angle - 0.4),
            mouse.y + vy - 8 * Math.sin(angle - 0.4)
          )
          ctx.moveTo(mouse.x + vx, mouse.y + vy)
          ctx.lineTo(
            mouse.x + vx - 8 * Math.cos(angle + 0.4),
            mouse.y + vy - 8 * Math.sin(angle + 0.4)
          )
          ctx.stroke()
        }
      }

      // Crosshair at mouse position
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])

      // Horizontal line
      ctx.beginPath()
      ctx.moveTo(mouse.x - 20, mouse.y)
      ctx.lineTo(mouse.x - 5, mouse.y)
      ctx.moveTo(mouse.x + 5, mouse.y)
      ctx.lineTo(mouse.x + 20, mouse.y)
      ctx.stroke()

      // Vertical line
      ctx.beginPath()
      ctx.moveTo(mouse.x, mouse.y - 20)
      ctx.lineTo(mouse.x, mouse.y - 5)
      ctx.moveTo(mouse.x, mouse.y + 5)
      ctx.lineTo(mouse.x, mouse.y + 20)
      ctx.stroke()

      ctx.setLineDash([])

      // Coordinate display
      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'
      ctx.fillText(`(${mouse.x}, ${mouse.y})`, mouse.x + 25, mouse.y - 5)

      frameRef.current++
      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [dimensions])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0 pointer-events-none transition-opacity duration-500"
      style={{
        zIndex: 1,
        opacity: isVisible ? 1 : 0,
      }}
    />
  )
}
