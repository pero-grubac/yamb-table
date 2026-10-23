import { useState } from 'react'
import Logo from '../components/Logo'
import Btn from '../components/Btn'
import Overlay from '../components/Overlay'
import { MODE_INFO, MAX_PLAYERS, STRAIGHT_RULES, BONUS_RULES, DEFAULT_RULES } from '../constants'

const MODE_COLORS = { yamb: 'var(--green)', yahtzee: 'var(--cyan)', yatzy: 'var(--purple)' }

export default function SetupPage({ onStart, hasSave, onResume, onClearSave }) {
  const [players,      setPlayers]      = useState([])
  const [mode,         setMode]         = useState('yamb')
  const [nameInput,    setNameInput]    = useState('')
  const [logoFade,     setLogoFade]     = useState(false)
  const [logoInfo,     setLogoInfo]     = useState(MODE_INFO.yamb)
  const [confirmClear, setConfirmClear] = useState(false)
  const [rules,        setRules]        = useState(DEFAULT_RULES)

  function addPlayer() {
    const name = nameInput.trim()
    if (!name) return
    if (players.length >= MAX_PLAYERS) return
    if (players.map(n => n.toLowerCase()).includes(name.toLowerCase())) return
    setPlayers(p => [...p, name])
    setNameInput('')
  }

  function removePlayer(i) {
    setPlayers(p => p.filter((_, j) => j !== i))
  }

  function changeMode(m) {
    setLogoFade(true)
    setTimeout(() => { setLogoInfo(MODE_INFO[m]); setLogoFade(false) }, 120)
    setMode(m)
  }

  return (
    <div className='screen'>
      <div style={{ opacity: logoFade ? 0 : 1, transition: 'opacity 0.12s' }}>
        <Logo title={logoInfo.title} sub={logoInfo.sub} />
      </div>

      {/* Players box */}
      <div style={{ border: '2px solid var(--green)', padding: 16, margin: '14px 0', position: 'relative', background: 'rgba(0,10,0,0.7)' }}>
        <BoxLabel>PLAYERS</BoxLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10, maxHeight: 180, overflowY: 'auto' }}>
          {players.length === 0 && (
            <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--gdim)', padding: '6px 0' }}>
              DODAJ NAJMANJE 2 IGRAČA
            </div>
          )}
          {players.map((name, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--gdim)', padding: '7px 10px', background: 'var(--gdim2)', animation: 'slideIn 0.2s ease' }}>
              <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--cyan)', flexShrink: 0 }}>P{i + 1}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', flex: 1, color: 'var(--green)' }}>{name}</span>
              <button onClick={() => removePlayer(i)} style={{ background: 'none', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--font-px)', fontSize: '0.5rem', padding: '2px 6px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
            placeholder='Ime igrača...'
            maxLength={20}
            style={{ flex: 1, background: 'rgba(0,20,0,0.85)', border: '2px solid var(--gdim)', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: '1rem', padding: '9px 12px', outline: 'none', borderRadius: 0 }}
          />
          <Btn onClick={addPlayer} color='var(--cyan)' sm style={{ width: 'auto', padding: '9px 14px', flexShrink: 0 }}>
            + DODAJ
          </Btn>
        </div>
        <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.46rem', color: 'var(--gdim)', marginTop: 8 }}>
          MIN 2 · MAX {MAX_PLAYERS}
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ border: '2px solid var(--green)', padding: 16, margin: '14px 0', position: 'relative', background: 'rgba(0,10,0,0.7)' }}>
        <BoxLabel>MOD IGRE</BoxLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', border: '2px solid var(--gdim)' }}>
          {['yamb', 'yahtzee', 'yatzy'].map((m, i) => {
            const active = mode === m
            const color  = MODE_COLORS[m]
            return (
              <button key={m} onClick={() => changeMode(m)} style={{
                padding: '10px 6px', textAlign: 'center', cursor: 'pointer',
                border: 'none', borderRight: i < 2 ? '1px solid var(--gdim)' : 'none',
                background: active ? 'rgba(57,255,20,0.1)' : 'transparent',
                color: active ? color : 'var(--gdim)',
                fontFamily: 'var(--font-px)', fontSize: '0.5rem', letterSpacing: '1px',
                transition: 'all 0.2s',
                textShadow: active ? `0 0 8px ${color}` : 'none',
              }}>
                <span style={{ fontSize: '0.5rem', display: 'block', marginBottom: 4 }}>{m.toUpperCase()}</span>
                <span style={{ fontSize: '0.44rem', opacity: 0.7, fontFamily: 'var(--font-mono)', display: 'block' }}>
                  {m === 'yamb' ? 'Balkanski · 4 kolone' : m === 'yahtzee' ? 'Classic · slobodno' : 'Skandinavski'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {mode === 'yamb' && <RulesPanel rules={rules} onChange={setRules} />}

      <Btn onClick={() => onStart(players, mode, mode === 'yamb' ? rules : DEFAULT_RULES)} color='var(--yellow)' disabled={players.length < 2} style={{ marginTop: 16 }}>
        ▶ POČNI IGRU
      </Btn>

      {hasSave() && (
        <>
          <Btn onClick={onResume} color='var(--cyan)' style={{ marginTop: 8 }}>▶ NASTAVI SAČUVANU IGRU</Btn>
          <Btn onClick={() => setConfirmClear(true)} color='var(--red)' sm style={{ marginTop: 8 }}>OBRIŠI SAČUVANO</Btn>
        </>
      )}

      <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.44rem', color: 'var(--gdim)', textAlign: 'center', marginTop: 16, lineHeight: 2.2 }}>
        YAMB v3.0 · AUTOSAVE · GITHUB PAGES
      </div>

      {confirmClear && (
        <Overlay
          title='OBRIŠI SAVE?'
          message='Ovo će trajno obrisati sačuvanu igru.'
          onConfirm={() => { onClearSave(); setConfirmClear(false) }}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  )
}

function RulesPanel({ rules, onChange }) {
  const [open, setOpen] = useState(false)
  const straight = STRAIGHT_RULES.find(r => r.id === rules.straight)
  const bonus    = BONUS_RULES.find(r => r.id === rules.bonus)

  return (
    <div style={{ border: '2px solid var(--green)', margin: '14px 0', position: 'relative', background: 'rgba(0,10,0,0.7)' }}>
      <BoxLabel>PRAVILA</BoxLabel>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', padding: '14px 16px 10px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--white)', lineHeight: 1.5 }}>
          Kenta: {straight.hint} · Bonus: {bonus.short}
        </span>
        <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--gdim)', flexShrink: 0 }}>
          {open ? '▲ ZATVORI' : '▼ OTVORI'}
        </span>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <RuleGroup title='KENTA (STRAIGHT)' options={STRAIGHT_RULES} value={rules.straight} onPick={id => onChange({ ...rules, straight: id })} />
          <RuleGroup title='BONUS MAX / MIN' options={BONUS_RULES} value={rules.bonus} onPick={id => onChange({ ...rules, bonus: id })} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gdim)', lineHeight: 1.5 }}>
            Prva opcija je podrazumijevana. Pravila se čuvaju uz igru. Ručni upis je uvijek slobodan.
          </div>
        </div>
      )}
    </div>
  )
}

function RuleGroup({ title, options, value, onPick }) {
  return (
    <div role='radiogroup' aria-label={title}>
      <div style={{ fontFamily: 'var(--font-px)', fontSize: '0.46rem', color: 'var(--cyan)', letterSpacing: '1px', marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {options.map(opt => {
          const active = opt.id === value
          return (
            <button key={opt.id} role='radio' aria-checked={active} onClick={() => onPick(opt.id)} style={{
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', cursor: 'pointer',
              padding: '7px 10px', background: active ? 'rgba(57,255,20,0.1)' : 'transparent',
              border: `1px solid ${active ? 'var(--green)' : 'var(--gdim)'}`,
              color: active ? 'var(--green)' : 'var(--gdim)',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
            }}>
              <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', flexShrink: 0 }}>{active ? '◉' : '○'}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BoxLabel({ children }) {
  return (
    <div style={{ position: 'absolute', top: -10, left: 12, background: 'var(--bg)', color: 'var(--cyan)', fontFamily: 'var(--font-px)', fontSize: '0.52rem', padding: '0 6px', textShadow: 'var(--gC)', letterSpacing: '2px' }}>
      {children}
    </div>
  )
}
