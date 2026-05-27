import ScoreCell from './ScoreCell'
import { getRows } from '../models/gameModel'
import { getCell } from '../models/gameModel'
import { calcUpper, calcBonus, calcLower, calcGrand } from '../services/gameService'

const tdBase = {
  padding: '4px 3px',
  borderBottom: '1px solid rgba(57,255,20,0.07)',
  verticalAlign: 'middle',
}

export default function FreeTable({ sheet, mode, isMine, pending, onInput }) {
  const allRows = getRows(mode)
  const upper   = allRows.filter(r => r.s === 'upper')
  const lower   = allRows.filter(r => r.s === 'lower')

  function CatRow({ row }) {
    const scored  = getCell(sheet, mode, null, row.id)
    const pending_ = pending[`free_${row.id}`]

    return (
      <tr>
        <td style={{ ...tdBase, fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.7rem,2vw,0.82rem)', color: 'var(--white)', paddingLeft: 2 }}>
          {row.name}
          <br />
          <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.28rem', color: 'var(--gdim)' }}>{row.hint}</span>
        </td>
        <td style={{ ...tdBase, textAlign: 'center', minWidth: 70 }}>
          <ScoreCell
            scored={scored}
            editable={isMine && scored === null}
            isNext={false}
            isNajavaActive={false}
            pendingValue={pending_}
            onChange={val => onInput(`free_${row.id}`, val)}
          />
        </td>
      </tr>
    )
  }

  return (
    <div style={{ overflowX: 'auto', margin: '0 -12px', padding: '0 12px 8px' }}>
      <table style={{ width: '100%', minWidth: 280, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.36rem', padding: '6px 4px', borderBottom: '2px solid var(--gdim)', textAlign: 'left', color: 'var(--gdim)' }}>KATEGORIJA</th>
            <th style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.38rem', padding: '6px 4px', borderBottom: '2px solid var(--gdim)', textAlign: 'center', color: 'var(--green)', textShadow: 'var(--gG)' }}>BODOVI</th>
          </tr>
        </thead>
        <tbody>
          <SectionHeader label='▸ UPPER' />
          {upper.map(r => <CatRow key={r.id} row={r} />)}
          <SubRow label='UPPER ZBIR' color='var(--cyan)' value={calcUpper(sheet, mode, null)} />
          <SubRow label={`BONUS (≥63)`} color='var(--yellow)' value={calcBonus(sheet, mode, null) > 0 ? `+${calcBonus(sheet, mode, null)}` : '—'} />

          <SectionHeader label='▸ LOWER' color='var(--purple)' bg='rgba(191,0,255,0.04)' />
          {lower.map(r => <CatRow key={r.id} row={r} />)}

          <tr style={{ background: 'rgba(0,30,0,0.9)', borderTop: '2px solid var(--cyan)' }}>
            <td style={{ fontFamily: 'var(--font-px)', fontSize: '0.42rem', color: 'var(--yellow)', textShadow: 'var(--gY)', padding: '7px 3px', letterSpacing: 2 }}>UKUPNO</td>
            <td style={{ textAlign: 'center', fontFamily: 'var(--font-px)', fontSize: '0.58rem', color: 'var(--yellow)', textShadow: 'var(--gY)', padding: '7px 3px' }}>{calcGrand(sheet, mode)} PTS</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SectionHeader({ label, color = 'var(--cyan)', bg = 'rgba(0,255,255,0.04)' }) {
  return (
    <tr>
      <td colSpan={2} style={{ fontFamily: 'var(--font-px)', fontSize: '0.34rem', color, padding: '5px 2px 3px', background: bg, letterSpacing: 2 }}>
        {label}
      </td>
    </tr>
  )
}

function SubRow({ label, color, value }) {
  return (
    <tr style={{ background: 'rgba(0,20,0,0.8)' }}>
      <td style={{ padding: '4px 3px', fontFamily: 'var(--font-px)', fontSize: '0.34rem', color, borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>{label}</td>
      <td style={{ padding: '4px 3px', textAlign: 'center', fontFamily: 'var(--font-px)', fontSize: '0.4rem', color, borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>{value}</td>
    </tr>
  )
}
