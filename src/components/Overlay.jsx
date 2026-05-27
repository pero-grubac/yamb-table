import Btn from './Btn'

export default function Overlay({ title, message, onConfirm, onCancel, titleColor = 'var(--red)' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0, 5, 0, 0.93)',
      zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        border: `2px solid ${titleColor}`,
        background: 'var(--bg2)',
        padding: '24px 20px',
        maxWidth: 340, width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.55rem', color: titleColor, letterSpacing: '2px', marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--white)', marginBottom: 18, lineHeight: 1.5 }}>
          {message}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Btn onClick={onConfirm} color={titleColor}>DA</Btn>
          <Btn onClick={onCancel}>NE</Btn>
        </div>
      </div>
    </div>
  )
}
