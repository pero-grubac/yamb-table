import ScoreCell from './ScoreCell'
import { YAMB_ROWS, YAMB_COLS } from '../constants'
import { isCellEditable, nextCellForCol, calcUpper, calcBonus, calcLower, calcColTotal, calcGrand, yambRowHint, bonusLabel } from '../services/gameService'
import { getCell } from '../models/gameModel'

const tdBase = {
  padding: '4px 3px',
  borderBottom: '1px solid rgba(57,255,20,0.07)',
  verticalAlign: 'middle',
}

const SECTIONS = [
  { label: '▸ GORNJI DIO', rows: YAMB_ROWS.filter(r => r.s === 'upper') },
  { label: '▸ MAX / MIN',  rows: YAMB_ROWS.filter(r => r.s === 'mid')   },
  { label: '▸ DONJI DIO',  rows: YAMB_ROWS.filter(r => r.s === 'lower') },
]

export default function YambTable({ sheet, rules, isMine, najava, pending, onInput }) {
  return (
    <div style={{ overflowX: 'auto', margin: '0 -12px', padding: '0 12px 8px', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: 340, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.5rem', padding: '6px 4px', borderBottom: '2px solid var(--gdim)', textAlign: 'left', color: 'var(--gdim)', minWidth: 80 }}>
              KAT.
            </th>
            {YAMB_COLS.map(col => (
              <th key={col.id} style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.5rem', padding: '6px 4px', borderBottom: '2px solid var(--gdim)', textAlign: 'center', color: col.color, textShadow: `0 0 8px ${col.color}`, whiteSpace: 'nowrap' }}>
                {col.label}<br />
                <span style={{ fontSize: '0.44rem', opacity: 0.7 }}>{col.full}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map(sect => (
            <SectionRows
              key={sect.label}
              sect={sect}
              sheet={sheet}
              rules={rules}
              isMine={isMine}
              najava={najava}
              pending={pending}
              onInput={onInput}
            />
          ))}

          {/* Column totals */}
          <tr style={{ background: 'rgba(0,20,0,0.8)' }}>
            <td style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--yellow)', borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>
              ZBIR KOLONE
            </td>
            {YAMB_COLS.map(col => (
              <td key={col.id} style={{ ...tdBase, textAlign: 'center', fontFamily: 'var(--font-px)', fontSize: '0.52rem', color: 'var(--yellow)', borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>
                {calcColTotal(sheet, 'yamb', col.id, rules)}
              </td>
            ))}
          </tr>

          {/* Grand total */}
          <tr style={{ background: 'rgba(0,30,0,0.9)', borderTop: '2px solid var(--cyan)' }}>
            <td style={{ fontFamily: 'var(--font-px)', fontSize: '0.55rem', color: 'var(--yellow)', textShadow: 'var(--gY)', padding: '7px 3px', letterSpacing: '2px' }}>
              UKUPNO
            </td>
            <td colSpan={4} style={{ textAlign: 'center', fontFamily: 'var(--font-px)', fontSize: '0.58rem', color: 'var(--yellow)', textShadow: 'var(--gY)', padding: '7px 3px' }}>
              {calcGrand(sheet, 'yamb', rules)} PTS
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SectionRows({ sect, sheet, rules, isMine, najava, pending, onInput }) {
  const firstRow = sect.rows[0]

  return (
    <>
      <tr>
        <td colSpan={5} style={{ fontFamily: 'var(--font-px)', fontSize: '0.5rem', color: 'var(--cyan)', padding: '5px 2px 3px', background: 'rgba(0,255,255,0.04)', letterSpacing: '2px' }}>
          {sect.label}
        </td>
      </tr>

      {sect.rows.map(row => (
        <tr key={row.id}>
          <td style={{ ...tdBase, fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.7rem,2vw,0.82rem)', color: 'var(--white)', paddingLeft: 2, whiteSpace: 'nowrap' }}>
            {row.name}
            <br />
            <span style={{ fontFamily: 'var(--font-px)', fontSize: '0.44rem', color: 'var(--gdim)' }}>{yambRowHint(row, rules)}</span>
          </td>

          {YAMB_COLS.map(col => {
            const scored   = getCell(sheet, 'yamb', col.id, row.id)
            const editable = isMine && isCellEditable(sheet, 'yamb', col.id, row.id, najava)
            const isNext   = isMine && (col.rule === 'down' || col.rule === 'up') && nextCellForCol(sheet, col.id) === row.id
            const isNajAct = najava?.colId === col.id && najava?.rowId === row.id
            const key      = `${col.id}_${row.id}`

            return (
              <td key={col.id} style={{ ...tdBase, textAlign: 'center', minWidth: 58 }}>
                <ScoreCell
                  scored={scored}
                  editable={editable}
                  isNext={isNext}
                  isNajavaActive={isNajAct}
                  pendingValue={pending[key]}
                  onChange={val => onInput(key, val)}
                  label={`${col.full} ${row.name}`}
                />
              </td>
            )
          })}
        </tr>
      ))}

      {/* Sub-total rows */}
      {firstRow.s === 'upper' && (
        <SubTotalRow label='GORNJI ZBIR' color='var(--cyan)' values={YAMB_COLS.map(c => calcUpper(sheet, 'yamb', c.id))} />
      )}
      {firstRow.s === 'mid' && (
        <SubTotalRow label={`BONUS ${bonusLabel(rules)}`} color='var(--yellow)' values={YAMB_COLS.map(c => { const b = calcBonus(sheet, 'yamb', c.id, rules); return b > 0 ? `+${b}` : '—' })} />
      )}
      {firstRow.s === 'lower' && (
        <SubTotalRow label='DONJI ZBIR' color='var(--purple)' values={YAMB_COLS.map(c => calcLower(sheet, 'yamb', c.id))} />
      )}
    </>
  )
}

function SubTotalRow({ label, color, values }) {
  return (
    <tr style={{ background: 'rgba(0,20,0,0.8)' }}>
      <td style={{ ...tdBase, fontFamily: 'var(--font-px)', fontSize: '0.5rem', color, borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>
        {label}
      </td>
      {values.map((v, i) => (
        <td key={i} style={{ ...tdBase, textAlign: 'center', fontFamily: 'var(--font-px)', fontSize: '0.52rem', color, borderTop: '1px solid var(--gdim)', borderBottom: '1px solid var(--gdim)' }}>
          {v}
        </td>
      ))}
    </tr>
  )
}
