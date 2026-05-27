import { useState } from 'react'

export default function Btn({ children, onClick, color = 'var(--green)', disabled, style = {}, sm = false }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      style={{
        display: 'block',
        width: '100%',
        padding: sm ? '7px 12px' : '11px 16px',
        background: hovered && !disabled ? color : 'transparent',
        border: `2px solid ${color}`,
        color: hovered && !disabled ? 'var(--bg)' : color,
        fontFamily: 'var(--font-px)',
        fontSize: sm ? '0.4rem' : 'clamp(0.45rem, 1.8vw, 0.58rem)',
        letterSpacing: '2px',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s',
        textAlign: 'center',
        outline: 'none',
        opacity: disabled ? 0.3 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
