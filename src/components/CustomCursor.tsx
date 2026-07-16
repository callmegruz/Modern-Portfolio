import { useEffect, useState, useRef } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [trail, setTrail] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const requestRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: -100, y: -100 })
  const [hasHover, setHasHover] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setHasHover(window.matchMedia('(hover: hover)').matches)
    }
  }, [])

  useEffect(() => {
    if (!hasHover) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeaveWindow = () => {
      setIsVisible(false)
    }

    const animateTrail = () => {
      setTrail((prev) => {
        const dx = mouseRef.current.x - prev.x
        const dy = mouseRef.current.y - prev.y
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        }
      })
      requestRef.current = requestAnimationFrame(animateTrail)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeaveWindow)
    requestRef.current = requestAnimationFrame(animateTrail)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeaveWindow)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [hasHover, isVisible])

  useEffect(() => {
    if (!hasHover) return

    const addHoverListeners = () => {
      const interactives = document.querySelectorAll(
        'a, button, input, textarea, .tilt-card, .theme-toggle, .mobile-toggle-btn, [role="button"]'
      )
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovered(true))
        el.addEventListener('mouseleave', () => setIsHovered(false))
      })
    }

    addHoverListeners()

    const observer = new MutationObserver(addHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [hasHover])

  if (!hasHover || !isVisible) return null

  return (
    <>
      {/* Inner Dot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '8px',
          height: '8px',
          backgroundColor: 'var(--secondary)',
          borderRadius: '50%',
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0) scale(${isHovered ? 0.5 : 1})`,
          transition: 'transform 0.1s ease-out, background-color 0.2s ease',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference'
        }}
      />
      {/* Outer Ring */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '32px',
          height: '32px',
          border: '1.5px solid var(--primary)',
          borderRadius: '50%',
          transform: `translate3d(${trail.x - 16}px, ${trail.y - 16}px, 0) scale(${isHovered ? 1.5 : 1})`,
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.2s ease, opacity 0.2s ease',
          backgroundColor: isHovered ? 'rgba(239, 71, 111, 0.08)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0.8
        }}
      />
    </>
  )
}
