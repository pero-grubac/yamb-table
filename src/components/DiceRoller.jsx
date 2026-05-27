import { useState } from 'react'
import Btn from './Btn'
import { MAX_ROLLS } from '../constants'

export default function DiceRoller({ vals, held, rolls, onRoll, onToggleHold, onReset, suggestions, onFillSugg }) {
  const [open, setOpen] = useState(false)

  const filledVals = vals.filter(v => v !== null)
  const sum = filledVals.reduce((a, b) => a + b, 0)
  const heldCount = held.filter(Boolean).length

  const titleText = rolls === 0
    ? 'BACI KOCKICE  ·  OPCIONO'
    : `KOCKICE: ${filledVals.join(' · ')}  (Σ=${sum})`

  const heldNote = rolls === 0
    ? 'BACI PRVO PA DRŽI KOCKICE'
    : heldCount > 0
      ? `${heldCount} DRŽI  ·  ${5 - heldCount} REBACUJE`
      : 'TAPNI KOCKICU ZA DRŽANJE'

  return (
    <div style={{ border: '2px solid var(--purple)', background: 'rgba(10,0,20,0.85)', margin: '12px 0', position: 'relative' }}>
      {/* Label */}
      <div style={{ position: 'absolute', top: -10, left: 12, background: 'var(--bg)', color: 'var(--purple)', fontFamily: 'var(--font-px)', fontSize: '0.37rem', padding: '0 6px', textShadow: 'var(--gP)', letterSpacing: '2px' }}>
        🎲 DICE ROLLER · OPCIONO
      </div>

      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', cursor: 'pointer', userSelect: 'none' }}>
        <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.4rem', color: 'var(--purple)', textShadow: 'var(--gP)', letterSpacing: '2px' }}>
          {titleText}
        </span>
        <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.36rem', color: 'var(--gdim)' }}>
          {open ? '▲ ZATVORI' : '▼ OTVORI'}
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px' }}>
          {/* Roll pips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 13, height: 13,
                border: '2px solid var(--purple)',
                borderRadius: '50%',
                background: i < rolls ? 'var(--purple)' : 'transparent',
                boxShadow: i < rolls ? 'var(--gP)' : 'none',
                transition: 'all 0.3s',
                flexShrink: 0,
              }} />
            ))}
            <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.33rem', color: rolls >= MAX_ROLLS ? 'var(--red)' : 'var(--gdim)', marginLeft: 4 }}>
              BACANJE {rolls} OD {MAX_ROLLS}
            </span>
          </div>

          {/* Dice */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(6px, 2vw, 12px)', marginBottom: 10 }}>
            {vals.map((v, i) => {
              const isHeld = held[i]
              const canHold = rolls > 0 && rolls < MAX_ROLLS
              return (
                <div key={i} onClick={() => canHold && onToggleHold(i)} style={{
                  width: 'clamp(46px, 11vw, 62px)', height: 'clamp(46px, 11vw, 62px)',
                  border: `3px solid ${isHeld ? 'var(--cyan)' : 'var(--gdim)'}`,
                  background: isHeld ? 'rgba(0,25,25,0.9)' : 'rgba(0,12,0,0.9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: canHold ? 'pointer' : 'default',
                  boxShadow: isHeld ? 'var(--gC)' : 'none',
                  position: 'relative', userSelect: 'none', flexShrink: 0,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}>
                  {v === null
                    ? <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.55rem', color: 'var(--gdim)' }}>?</span>
                    : <span style={{ fontFamily: 'var(--font-px)', fontSize: 'clamp(0.9rem, 3vw, 1.3rem)', color: isHeld ? 'var(--cyan)' : 'var(--green)', textShadow: isHeld ? 'var(--gC)' : 'var(--gG)', lineHeight: 1 }}>{v}</span>
                  }
                  {isHeld && (
                    <span style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-px)', fontSize: '0.27rem', color: 'var(--cyan)', whiteSpace: 'nowrap' }}>HOLD</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Held note */}
          <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.31rem', color: 'var(--cyan)', textAlign: 'center', marginBottom: 10, minHeight: 16, letterSpacing: 1 }}>
            {heldNote}
          </div>

          {/* Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <Btn onClick={onRoll} color='var(--purple)' disabled={rolls >= MAX_ROLLS}>
              {rolls >= MAX_ROLLS ? '🎲 NEMA BACANJA' : rolls === 0 ? '🎲 BACI SVE' : '🎲 REBACI'}
            </Btn>
            <Btn onClick={onReset}>↺ RESET</Btn>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ borderTop: '1px dashed rgba(191,0,255,0.3)', paddingTop: 10 }}>
              <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.33rem', color: 'var(--gdim)', letterSpacing: 2, marginBottom: 8 }}>
                ▸ PRIJEDLOZI:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => onFillSugg(s)} style={{
                    border: '1px solid var(--yellow)', color: 'var(--yellow)',
                    fontFamily: 'var(--font-px)', fontSize: '0.3rem',
                    padding: '4px 9px', cursor: 'pointer', background: 'transparent', letterSpacing: 1,
                  }}>
                    {s.label} → {s.score}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
