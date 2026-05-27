import { YAMB_ROWS, YAMB_COLS } from '../constants'
import { getCell, getRows } from '../models/gameModel'

/* ═══════════════════════════════════════
   SCORE CALCULATIONS
═══════════════════════════════════════ */

export function calcUpper(sheet, mode, colId) {
  const rows = (mode === 'yamb' ? YAMB_ROWS : getRows(mode)).filter(r => r.s === 'upper')
  return rows.reduce((sum, r) => sum + (getCell(sheet, mode, colId, r.id) || 0), 0)
}

export function calcMid(sheet, colId) {
  const max = getCell(sheet, 'yamb', colId, 'max') || 0
  const min = getCell(sheet, 'yamb', colId, 'min') || 0
  return max + min
}

export function calcBonus(sheet, mode, colId) {
  if (mode === 'yamb') {
    const max = getCell(sheet, mode, colId, 'max') || 0
    const min = getCell(sheet, mode, colId, 'min') || 0
    return (max - min) * 10
  }
  const upper = calcUpper(sheet, mode, null)
  return upper >= 63 ? (mode === 'yatzy' ? 50 : 35) : 0
}

export function calcLower(sheet, mode, colId) {
  const rows = (mode === 'yamb' ? YAMB_ROWS : getRows(mode)).filter(r => r.s === 'lower')
  return rows.reduce((sum, r) => sum + (getCell(sheet, mode, colId, r.id) || 0), 0)
}

export function calcColTotal(sheet, mode, colId) {
  if (mode === 'yamb') {
    return (
      calcUpper(sheet, mode, colId) +
      calcMid(sheet, colId) +
      calcLower(sheet, mode, colId) +
      calcBonus(sheet, mode, colId)
    )
  }
  return calcUpper(sheet, mode, null) + calcLower(sheet, mode, null) + calcBonus(sheet, mode, null)
}

export function calcGrand(sheet, mode) {
  if (mode === 'yamb') {
    return YAMB_COLS.reduce((sum, col) => sum + calcColTotal(sheet, mode, col.id), 0)
  }
  return calcColTotal(sheet, mode, null)
}

/* ═══════════════════════════════════════
   CELL AVAILABILITY RULES
═══════════════════════════════════════ */

/**
 * Returns the next fillable rowId for dolje/gore columns.
 */
export function nextCellForCol(sheet, colId) {
  const col = YAMB_COLS.find(c => c.id === colId)
  if (!col) return null

  if (col.rule === 'down') {
    for (let i = 0; i < YAMB_ROWS.length; i++) {
      if (getCell(sheet, 'yamb', colId, YAMB_ROWS[i].id) === null) return YAMB_ROWS[i].id
    }
  }
  if (col.rule === 'up') {
    for (let i = YAMB_ROWS.length - 1; i >= 0; i--) {
      if (getCell(sheet, 'yamb', colId, YAMB_ROWS[i].id) === null) return YAMB_ROWS[i].id
    }
  }
  return null
}

/**
 * Returns true if the given cell can currently be edited by the player.
 */
export function isCellEditable(sheet, mode, colId, rowId, najava) {
  // Already scored → never editable
  if (getCell(sheet, mode, colId, rowId) !== null) return false

  if (mode !== 'yamb') return true

  const col = YAMB_COLS.find(c => c.id === colId)
  if (!col) return false

  switch (col.rule) {
    case 'free':
      return true
    case 'announce':
      return najava?.colId === colId && najava?.rowId === rowId
    case 'down': {
      const idx = YAMB_ROWS.findIndex(r => r.id === rowId)
      if (idx === 0) return true
      return getCell(sheet, mode, colId, YAMB_ROWS[idx - 1].id) !== null
    }
    case 'up': {
      const idx = YAMB_ROWS.findIndex(r => r.id === rowId)
      if (idx === YAMB_ROWS.length - 1) return true
      return getCell(sheet, mode, colId, YAMB_ROWS[idx + 1].id) !== null
    }
    default:
      return false
  }
}

/**
 * Returns true if all categories for the player have been scored.
 */
export function isPlayerDone(sheet, mode) {
  if (mode === 'yamb') {
    return YAMB_COLS.every(col =>
      YAMB_ROWS.every(row => getCell(sheet, mode, col.id, row.id) !== null)
    )
  }
  return getRows(mode).every(row => getCell(sheet, mode, null, row.id) !== null)
}

/* ═══════════════════════════════════════
   TURN SUBMISSION
═══════════════════════════════════════ */

/**
 * Applies pending inputs to a sheet copy.
 * Returns { newSheet, error } — error is a string if validation fails.
 */
export function applyTurn(sheet, mode, pending, najava) {
  const next = JSON.parse(JSON.stringify(sheet))

  if (mode === 'yamb') {
    const slobEntries  = Object.entries(pending).filter(([k, v]) => k.startsWith('slobodno_') && v !== '')
    const otherEntries = Object.entries(pending).filter(([k, v]) => !k.startsWith('slobodno_'))

    if (slobEntries.length > 1) {
      return { newSheet: null, error: 'SLOBODNA: SAMO JEDNO POLJE PO POTEZU!' }
    }

    // dolje / gore / najava — save each editable cell (0 if blank = sacrifice)
    otherEntries.forEach(([key, val]) => {
      const [colId, rowId] = key.split('_')
      next[colId][rowId] = val === '' ? 0 : parseInt(val, 10)
    })

    // slobodno — only if player filled one
    slobEntries.forEach(([key, val]) => {
      const rowId = key.replace('slobodno_', '')
      next['slobodno'][rowId] = parseInt(val, 10)
    })

    // najava — if declared but not filled, sacrifice = 0
    if (najava && next['najava'][najava.rowId] === null) {
      next['najava'][najava.rowId] = 0
    }

  } else {
    // Yahtzee / Yatzy: exactly one category per turn
    const filled = Object.entries(pending).filter(([, v]) => v !== '')

    if (filled.length === 0) return { newSheet: null, error: 'UPIŠI JEDNU KATEGORIJU' }
    if (filled.length > 1)   return { newSheet: null, error: 'SAMO JEDNA KATEGORIJA PO POTEZU!' }

    const [[key, val]] = filled
    const rowId = key.replace('free_', '')

    if (getCell(sheet, mode, null, rowId) !== null) {
      return { newSheet: null, error: 'KATEGORIJA VEĆ UPISANA' }
    }

    next[rowId] = parseInt(val, 10)
  }

  return { newSheet: next, error: null }
}

/* ═══════════════════════════════════════
   DICE SUGGESTIONS
═══════════════════════════════════════ */

function checkStraight(unique, len) {
  for (let i = 0; i <= unique.length - len; i++) {
    let run = 1
    for (let j = i + 1; j < unique.length && unique[j] === unique[j - 1] + 1; j++) run++
    if (run >= len) return true
  }
  return false
}

function scoreForRow(rowId, vals, freq, counts, sum, unique, mode) {
  const numMap = { ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6 }

  if (numMap[rowId]) {
    const n = numMap[rowId]
    const s = vals.filter(v => v === n).reduce((a, b) => a + b, 0)
    return s >= n * 2 ? s : null
  }

  switch (rowId) {
    case 'max':    return sum >= 22 ? sum : null
    case 'min':    return sum <= 16 ? sum : null
    case '3kind':  return counts[0] >= 3 ? sum : null
    case '4kind':
    case 'poker':  return counts[0] >= 4 ? sum : null
    case 'fhouse':
    case 'full': {
      const ok = (counts[0] === 3 && counts[1] === 2) || counts[0] === 5
      if (!ok) return null
      return mode === 'yahtzee' ? 25 : sum
    }
    case 'sstr': {
      if (!checkStraight(unique, 4)) return null
      if (mode === 'yatzy') return 15
      if (mode === 'yamb')  return checkStraight(unique, 5) ? 66 : 45
      return 30
    }
    case 'str': {
      if (checkStraight(unique, 5) && unique[0] === 1 && unique[4] === 6) return 66
      if (checkStraight(unique, 5)) return 45
      return null
    }
    case 'lstr':    return checkStraight(unique, 5) ? (mode === 'yatzy' ? 20 : 40) : null
    case 'yahtzee':
    case 'yatzy':
    case 'yamb':   return counts[0] === 5 ? 50 : null
    case 'chance': return sum >= 18 ? sum : null
    case '1pair': {
      const pv = Object.entries(freq).filter(([, c]) => c >= 2).map(([v]) => +v).sort((a, b) => b - a)[0]
      return pv ? pv * 2 : null
    }
    case '2pair': {
      const ps = Object.entries(freq).filter(([, c]) => c >= 2).map(([v]) => +v)
      return ps.length >= 2
        ? ps.sort((a, b) => b - a).slice(0, 2).reduce((a, b) => a + b * 2, 0)
        : null
    }
    default: return null
  }
}

export function getSuggestions(diceVals, sheet, mode, najava) {
  const vals = diceVals.filter(v => v !== null)
  if (vals.length === 0) return []

  const freq = {}
  vals.forEach(v => { freq[v] = (freq[v] || 0) + 1 })
  const counts = Object.values(freq).sort((a, b) => b - a)
  const sum    = vals.reduce((a, b) => a + b, 0)
  const unique = [...new Set(vals)].sort((a, b) => a - b)

  const results = []

  if (mode === 'yamb') {
    YAMB_COLS.forEach(col => {
      YAMB_ROWS.forEach(row => {
        if (!isCellEditable(sheet, mode, col.id, row.id, najava)) return
        if (getCell(sheet, mode, col.id, row.id) !== null) return
        const score = scoreForRow(row.id, vals, freq, counts, sum, unique, mode)
        if (score === null || score === 0) return
        results.push({ label: `${col.full}: ${row.name}`, colId: col.id, rowId: row.id, score })
      })
    })
  } else {
    getRows(mode).forEach(row => {
      if (getCell(sheet, mode, null, row.id) !== null) return
      const score = scoreForRow(row.id, vals, freq, counts, sum, unique, mode)
      if (score === null || score === 0) return
      results.push({ label: row.name, colId: 'free', rowId: row.id, score })
    })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}
