export default function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg2)',
      border: '2px solid var(--cyan)',
      color: 'var(--cyan)',
      fontFamily: 'var(--font-px)',
      fontSize: '0.5rem',
      padding: '9px 18px',
      letterSpacing: '2px',
      zIndex: 10000,
      whiteSpace: 'nowrap',
      boxShadow: 'var(--gC)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}
