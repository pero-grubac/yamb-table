export default function ScoreCell({ scored, editable, isNext, isNajavaActive, pendingValue, onChange, label }) {
  const cellBase = {
    width: 52, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: '0.88rem',
    margin: 'auto',
  }

  if (scored !== null) {
    return (
      <div style={{
        ...cellBase,
        border: '1px solid rgba(57,255,20,0.2)',
        background: 'rgba(57,255,20,0.04)',
        color: scored === 0 ? 'rgba(255,34,68,0.5)' : 'var(--green)',
      }}>
        {scored === 0 ? '—' : scored}
      </div>
    )
  }

  if (editable) {
    const borderColor = isNajavaActive ? 'var(--orange)' : isNext ? 'var(--cyan)' : 'var(--gdim)'
    const boxShadow   = isNajavaActive ? 'var(--gO)' : isNext ? '0 0 6px rgba(0,255,255,0.3)' : 'none'

    return (
      <input
        type='number'
        aria-label={label}
        min={0}
        max={999}
        placeholder='—'
        value={pendingValue ?? ''}
        onChange={e => {
          const raw = e.target.value
          if (raw === '') { onChange(''); return }
          const n = Math.max(0, Math.min(999, parseInt(raw, 10) || 0))
          onChange(String(n))
        }}
        style={{
          width: 52, height: 34,
          textAlign: 'center', padding: 2,
          background: 'rgba(0,15,0,0.9)',
          border: `1px solid ${borderColor}`,
          color: 'var(--green)',
          fontFamily: 'var(--font-mono)', fontSize: '0.88rem',
          outline: 'none', WebkitAppearance: 'none', borderRadius: 0,
          boxShadow,
          animation: isNajavaActive ? 'najPulse 1s infinite' : 'none',
          display: 'block', margin: 'auto',
        }}
      />
    )
  }

  // Blocked cell
  return (
    <div style={{
      ...cellBase,
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(57,255,20,0.06)',
      fontFamily: 'var(--font-px)', fontSize: '0.5rem',
      color: 'rgba(57,255,20,0.12)',
    }}>
      ░
    </div>
  )
}
