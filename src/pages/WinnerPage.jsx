import Btn from '../components/Btn'
import { calcGrand } from '../services/gameService'

const COLORS = ['var(--yellow)', 'var(--cyan)',   'var(--purple)']
const GLOWS  = ['var(--gY)',     'var(--gC)',      'var(--gP)'    ]
const MEDALS = ['🥇',            '🥈',             '🥉'           ]

export default function WinnerPage({ players, mode, onNewGame }) {
  const ranked = [...players]
    .map(p => ({ name: p.name, score: calcGrand(p.sheet, mode) }))
    .sort((a, b) => b.score - a.score)

  const podiumOrder = ranked.length === 1 ? [0]
    : ranked.length === 2 ? [1, 0]
    : [1, 0, 2]

  const podiumHeights = [110, 80, 58]

  return (
    <div className='screen' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
      <div style={{ fontFamily: 'var(--font-px)', fontSize: 'clamp(0.7rem, 3.5vw, 1.2rem)', color: 'var(--yellow)', textShadow: 'var(--gY)', animation: 'flicker 3s infinite', letterSpacing: '4px', marginTop: 28 }}>
        IGRA GOTOVA!
      </div>

      <div style={{ fontSize: '1.6rem', animation: 'spin 2s linear infinite', filter: 'drop-shadow(0 0 10px var(--yellow))' }}>★</div>

      <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.36rem', color: 'var(--gdim)', letterSpacing: '3px' }}>POBJEDNIK</div>
      <div style={{ fontFamily: 'var(--font-px)', fontSize: 'clamp(0.9rem, 3.5vw, 1.3rem)', color: 'var(--yellow)', textShadow: 'var(--gY)', letterSpacing: '4px', wordBreak: 'break-word' }}>
        {ranked[0].name.toUpperCase()}
      </div>

      {/* Podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, width: '100%' }}>
        {podiumOrder.map(ri => {
          if (!ranked[ri]) return null
          return (
            <div key={ri} style={{ flex: 1, maxWidth: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.33rem', color: COLORS[ri], textShadow: GLOWS[ri], wordBreak: 'break-word', textAlign: 'center', lineHeight: 1.6 }}>
                {ranked[ri].name}
              </div>
              <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.45rem', color: COLORS[ri] }}>
                {ranked[ri].score} PTS
              </div>
              <div style={{ width: '100%', height: podiumHeights[ri], border: `2px solid ${COLORS[ri]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: GLOWS[ri], background: 'rgba(0,0,0,0.3)', fontFamily: 'var(--font-px)', fontSize: 'clamp(0.8rem, 2.5vw, 1.1rem)' }}>
                {MEDALS[ri] || ri + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* Full rankings */}
      <div style={{ width: '100%', border: '2px solid var(--gdim)', background: 'rgba(0,10,0,0.8)' }}>
        {ranked.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderBottom: i < ranked.length - 1 ? '1px solid rgba(57,255,20,0.1)' : 'none' }}>
            <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.38rem', color: 'var(--gdim)', width: 22 }}>#{i + 1}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', flex: 1, padding: '0 8px', color: COLORS[i] || 'var(--green)', textShadow: GLOWS[i] || 'var(--gG)' }}>{p.name}</span>
            <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: COLORS[i] || 'var(--green)' }}>{p.score}</span>
          </div>
        ))}
      </div>

      <Btn onClick={onNewGame} color='var(--yellow)' style={{ maxWidth: 280 }}>▶ NOVA IGRA</Btn>
      <div style={{ height: 30 }} />
    </div>
  )
}
