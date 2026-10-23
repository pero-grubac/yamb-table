import { useState, useMemo } from 'react'
import Btn from '../components/Btn'
import Overlay from '../components/Overlay'
import Toast from '../components/Toast'
import PlayerTabs from '../components/PlayerTabs'
import DiceRoller from '../components/DiceRoller'
import YambTable from '../components/YambTable'
import FreeTable from '../components/FreeTable'
import UndoBtn from '../components/UndoBtn'
import { YAMB_ROWS, YAMB_COLS } from '../constants'
import { getSuggestions } from '../services/gameService'
import { getCell } from '../models/gameModel'
import { useDice } from '../hooks/useDice'
import { useToast } from '../hooks/useToast'

export default function GamePage({ game, onTurnEnd, onQuit, undoName, onUndo }) {
  const { players, mode, curIdx, rules } = game

  const [viewIdx,      setViewIdx]      = useState(curIdx)
  const [pending,      setPending]      = useState({})
  const [najava,       setNajava]       = useState(null)
  const [showNajava,   setShowNajava]   = useState(false)
  const [confirmQuit,  setConfirmQuit]  = useState(false)

  const dice = useDice()
  const { message: toastMsg, toast } = useToast()

  const isMine      = viewIdx === curIdx
  const curPlayer   = players[curIdx]
  const viewPlayer  = players[viewIdx]

  /* ── Input handling ── */
  function handleInput(key, val) {
    setPending(p => ({ ...p, [key]: val }))
  }

  /* ── Fill from suggestion ── */
  function handleFillSugg(sugg) {
    const key = sugg.colId === 'free' ? `free_${sugg.rowId}` : `${sugg.colId}_${sugg.rowId}`
    setPending(p => ({ ...p, [key]: String(sugg.score) }))
    toast(`POPUNJENO: ${sugg.score} BODOVA`)
  }

  /* ── Submit turn ── */
  function submitTurn() {
    const error = onTurnEnd(curIdx, pending, najava)
    if (error) toast(error)
  }

  /* ── Dice suggestions (only for current player after rolling) ── */
  const suggestions = useMemo(() => {
    if (!isMine || dice.rolls === 0) return []
    return getSuggestions(dice.vals, curPlayer.sheet, mode, najava, { rules, roll: dice.rolls })
  }, [dice.vals, dice.rolls, isMine, curPlayer.sheet, mode, najava, rules])

  return (
    <div className='screen'>
      {/* Tabs */}
      <PlayerTabs players={players} mode={mode} curIdx={curIdx} viewIdx={viewIdx} onSelect={setViewIdx} />

      {/* Turn header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 6px', flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-px)', fontSize: 'clamp(0.5rem,2.2vw,0.7rem)', color: 'var(--cyan)', textShadow: 'var(--gC)', letterSpacing: '2px' }}>
            {viewPlayer.name.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.46rem', color: 'var(--gdim)', marginTop: 3 }}>
            {isMine ? `▶ TVOJ RED · ${mode.toUpperCase()}` : `PREGLEDAŠ: ${viewPlayer.name.toUpperCase()}`}
          </div>
        </div>
        {!isMine && (
          <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--yellow)', border: '1px solid var(--yellow)', padding: '3px 7px', animation: 'najPulse 2s infinite' }}>
            👁 SAMO PREGLED
          </div>
        )}
      </div>

      {/* Dice roller — only for current player */}
      {isMine && (
        <DiceRoller
          vals={dice.vals}
          held={dice.held}
          rolls={dice.rolls}
          onRoll={dice.roll}
          onToggleHold={dice.toggleHold}
          onReset={dice.reset}
          suggestions={suggestions}
          onFillSugg={handleFillSugg}
        />
      )}

      {/* Score sheet */}
      {mode === 'yamb' ? (
        <YambTable
          sheet={viewPlayer.sheet}
          rules={rules}
          isMine={isMine}
          najava={isMine ? najava : null}
          pending={isMine ? pending : {}}
          onInput={handleInput}
        />
      ) : (
        <FreeTable
          sheet={viewPlayer.sheet}
          mode={mode}
          isMine={isMine}
          pending={isMine ? pending : {}}
          onInput={handleInput}
        />
      )}

      {/* Action buttons */}
      {isMine && (
        <div style={{ marginTop: 14 }}>
          {mode === 'yamb' && najava && (
            <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--orange)', marginBottom: 8, letterSpacing: 1 }}>
              ! NAJAVA: {YAMB_COLS.find(c => c.id === najava.colId)?.full} → {YAMB_ROWS.find(r => r.id === najava.rowId)?.name}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Btn onClick={submitTurn} color='var(--cyan)'>ZAVRŠI RED</Btn>
            {mode === 'yamb'
              ? <Btn onClick={() => setShowNajava(true)} color='var(--orange)'>! NAJAVA</Btn>
              : <Btn onClick={() => setPending({})} color='var(--yellow)'>OBRIŠI</Btn>
            }
          </div>
          <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--gdim)', textAlign: 'center', marginTop: 8, letterSpacing: 1 }}>
            {mode === 'yamb' ? 'JEDNO POLJE PO POTEZU PO KOLONI' : 'JEDNA KATEGORIJA PO POTEZU'}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, borderTop: '1px solid var(--gdim)', paddingTop: 12, display: 'grid', gap: 8 }}>
        <UndoBtn playerName={undoName} onUndo={onUndo} />
        <Btn onClick={() => setConfirmQuit(true)} color='var(--red)' sm>⬛ ODUSTANI I RESETUJ</Btn>
      </div>

      {/* Najava overlay */}
      {showNajava && (
        <NajavaOverlay
          sheet={curPlayer.sheet}
          onSelect={rowId => { setNajava({ colId: 'najava', rowId }); setShowNajava(false); toast('NAJAVA: ' + YAMB_ROWS.find(r => r.id === rowId)?.name) }}
          onCancel={() => setShowNajava(false)}
        />
      )}

      {confirmQuit && <Overlay title='ODUSTATI?' message='Trenutni napredak će biti izgubljen.' onConfirm={onQuit} onCancel={() => setConfirmQuit(false)} />}
      <Toast message={toastMsg} />
    </div>
  )
}

function NajavaOverlay({ sheet, onSelect, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,5,0,0.94)', zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: '2px solid var(--orange)', background: 'var(--bg2)', padding: '24px 20px', maxWidth: 380, width: '100%', boxShadow: 'var(--gO)' }}>
        <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.58rem', color: 'var(--orange)', textShadow: 'var(--gO)', letterSpacing: '2px', marginBottom: 6, textAlign: 'center' }}>! NAJAVA !</div>
        <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.46rem', color: 'var(--gdim)', textAlign: 'center', marginBottom: 16, letterSpacing: '1px' }}>ODABERI KATEGORIJU PRIJE BACANJA</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {YAMB_ROWS.map(row => {
            const taken = getCell(sheet, 'yamb', 'najava', row.id) !== null
            return (
              <button key={row.id} onClick={() => !taken && onSelect(row.id)} style={{ background: 'transparent', border: `1px solid ${taken ? 'var(--gdim)' : 'var(--orange)'}`, color: taken ? 'var(--gdim)' : 'var(--orange)', fontFamily: 'var(--font-px)', fontSize: '0.5rem', padding: '6px 10px', cursor: taken ? 'default' : 'pointer', letterSpacing: 1, opacity: taken ? 0.45 : 1 }}>
                {row.name}{taken ? ' ✓' : ''}
              </button>
            )
          })}
        </div>
        <Btn onClick={onCancel} sm style={{ marginTop: 12 }}>ODUSTANI</Btn>
      </div>
    </div>
  )
}
