import Btn from '../components/Btn'
import Logo from '../components/Logo'
import UndoBtn from '../components/UndoBtn'

export default function PassPage({ playerName, onReady, undoName, onUndo }) {
  return (
    <div className='screen' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
      <Logo title='YAMB' sub='▶ BALKANSKI DICE TRACKER ◀' />
      <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.55rem', color: 'var(--gdim)', letterSpacing: '3px' }}>PREDAJ UREĐAJ</div>
      <div style={{ fontSize: '3.5rem', animation: 'bounce 1s infinite', filter: 'drop-shadow(0 0 12px var(--cyan))' }}>📱</div>
      <div style={{ fontFamily: 'var(--font-px)', fontSize: 'clamp(0.9rem, 4vw, 1.4rem)', color: 'var(--cyan)', textShadow: 'var(--gC)', letterSpacing: '4px', wordBreak: 'break-word' }}>
        {playerName.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.55rem', color: 'var(--gdim)', letterSpacing: '3px', marginTop: 6 }}>
        PRITISNI KAD SI SPREMAN
      </div>
      <Btn onClick={onReady} color='var(--cyan)' style={{ maxWidth: 260, marginTop: 24 }}>
        ▶ SPREMAN SAM
      </Btn>
      <UndoBtn playerName={undoName} onUndo={onUndo} style={{ maxWidth: 260 }} />
    </div>
  )
}
