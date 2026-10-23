import { isPlayerDone } from '../services/gameService'

export default function PlayerTabs({ players, mode, curIdx, viewIdx, onSelect }) {
  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '10px -12px 0', padding: '0 12px', scrollbarWidth: 'none' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid var(--gdim)', width: 'max-content', minWidth: '100%' }}>
        {players.map((p, i) => {
          const isView = i === viewIdx
          const isCur  = i === curIdx
          const done   = isPlayerDone(p.sheet, mode)

          return (
            <button key={i} onClick={() => onSelect(i)} style={{
              padding: '7px 12px',
              fontFamily: 'var(--font-px)', fontSize: '0.5rem',
              cursor: 'pointer', border: 'none', background: 'transparent',
              color: isView ? (isCur ? 'var(--cyan)' : 'var(--green)') : 'var(--gdim)',
              borderBottom: `2px solid ${isView ? (isCur ? 'var(--cyan)' : 'var(--green)') : 'transparent'}`,
              marginBottom: -2,
              transition: 'all 0.15s', whiteSpace: 'nowrap', letterSpacing: '1px',
              textShadow: isView ? (isCur ? 'var(--gC)' : 'var(--gG)') : 'none',
            }}>
              {p.name}{done ? ' ✓' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
