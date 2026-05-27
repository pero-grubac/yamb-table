export default function Logo({ title, sub }) {
  return (
    <div style={{
      fontFamily: 'var(--font-px)',
      fontSize: 'clamp(1.8rem, 8vw, 3rem)',
      color: 'var(--green)',
      textShadow: 'var(--gG)',
      textAlign: 'center',
      letterSpacing: '8px',
      animation: 'flicker 4s infinite',
      lineHeight: 1.4,
      margin: '24px 0 20px',
    }}>
      {title}
      <span style={{
        display: 'block',
        fontSize: 'clamp(0.3rem, 1.4vw, 0.46rem)',
        color: 'var(--cyan)',
        textShadow: 'var(--gC)',
        letterSpacing: '3px',
        marginTop: '6px',
        animation: 'none',
      }}>
        {sub}
      </span>
    </div>
  )
}
