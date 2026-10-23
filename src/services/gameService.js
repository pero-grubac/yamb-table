import { YAMB_ROWS, YAMB_COLS, STRAIGHT_RULES, BONUS_RULES, DEFAULT_RULES, UNDO_LIMIT } from '../constants/index.js'
import { getCell, getRows, normalizeRules } from '../models/gameModel.js'

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

/**
 * Yamb: (MAX − MIN) × 10, or × the number of ones in the column when
 * rules.bonus is 'timesOnes' (ones not filled yet count as 0, so no bonus).
 */
export function calcBonus(sheet, mode, colId, rules = DEFAULT_RULES) {
  if (mode === 'yamb') {
    const max = getCell(sheet, mode, colId, 'max') || 0
    const min = getCell(sheet, mode, colId, 'min') || 0
    const factor = normalizeRules(rules).bonus === 'timesOnes'
      ? getCell(sheet, mode, colId, 'ones') || 0
      : 10
    return (max - min) * factor
  }
  const upper = calcUpper(sheet, mode, null)
  return upper >= 63 ? (mode === 'yatzy' ? 50 : 35) : 0
}

export function calcLower(sheet, mode, colId) {
  const rows = (mode === 'yamb' ? YAMB_ROWS : getRows(mode)).filter(r => r.s === 'lower')
  return rows.reduce((sum, r) => sum + (getCell(sheet, mode, colId, r.id) || 0), 0)
}

export function calcColTotal(sheet, mode, colId, rules = DEFAULT_RULES) {
  if (mode === 'yamb') {
    return (
      calcUpper(sheet, mode, colId) +
      calcMid(sheet, colId) +
      calcLower(sheet, mode, colId) +
      calcBonus(sheet, mode, colId, rules)
    )
  }
  return calcUpper(sheet, mode, null) + calcLower(sheet, mode, null) + calcBonus(sheet, mode, null)
}

export function calcGrand(sheet, mode, rules = DEFAULT_RULES) {
  if (mode === 'yamb') {
    return YAMB_COLS.reduce((sum, col) => sum + calcColTotal(sheet, mode, col.id, rules), 0)
  }
  return calcColTotal(sheet, mode, null)
}

/* ═══════════════════════════════════════
   HOUSE RULES (YAMB)
═══════════════════════════════════════ */

/**
 * Points for a Yamb straight (kenta). dice are the five values, roll is the
 * roll number 1–3 it was made in (null if unknown, treated as a later roll).
 * Returns null when the dice are not a straight.
 */
export function straightScore(dice, rules = DEFAULT_RULES, roll = null) {
  const unique = [...new Set(dice.filter(v => v !== null))].sort((a, b) => a - b)
  if (unique.length !== 5 || unique[4] - unique[0] !== 4) return null

  switch (normalizeRules(rules).straight) {
    case 'perRoll':    return [66, 56, 46][(roll || 3) - 1] ?? 46
    case 'smallLarge': return unique[0] === 1 ? 35 : 45
    default:           return roll === 1 ? 66 : 45
  }
}

/** Row hint for the Yamb table, following the chosen straight rule. */
export function yambRowHint(row, rules = DEFAULT_RULES) {
  if (row.id !== 'str') return row.hint
  return STRAIGHT_RULES.find(r => r.id === normalizeRules(rules).straight).hint
}

/** Short label of the chosen MAX/MIN bonus rule, e.g. '(M−m)×10'. */
export function bonusLabel(rules = DEFAULT_RULES) {
  return BONUS_RULES.find(r => r.id === normalizeRules(rules).bonus).short
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
    const otherEntries = Object.entries(pending).filter(([k]) => !k.startsWith('slobodno_'))

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

/**
 * Plays one turn on the whole game: applies the inputs, remembers the
 * previous state for undo and moves on to the next player (or the winner).
 * Returns { game, error }; the input game is never mutated.
 */
export function playTurn(game, playerIdx, pending, najava) {
  const { newSheet, error } = applyTurn(game.players[playerIdx].sheet, game.mode, pending, najava)
  if (error) return { game: null, error }

  const snapshot = { curIdx: game.curIdx, sheets: game.players.map(p => p.sheet) }
  const next = JSON.parse(JSON.stringify({ ...game, history: [] }))
  next.history = [...(game.history || []), JSON.parse(JSON.stringify(snapshot))].slice(-UNDO_LIMIT)
  next.players[playerIdx].sheet = newSheet

  // Everyone done → winner
  if (next.players.every(p => isPlayerDone(p.sheet, next.mode))) {
    next.phase = 'winner'
    return { game: next, error: null }
  }

  // Advance to next non-done player
  let idx = (playerIdx + 1) % next.players.length
  let safety = 0
  while (isPlayerDone(next.players[idx].sheet, next.mode) && safety < next.players.length) {
    idx = (idx + 1) % next.players.length
    safety++
  }

  next.curIdx = idx
  next.phase  = 'pass'
  return { game: next, error: null }
}

/** True when there is a move to undo. */
export function canUndo(game) {
  return !!game?.history?.length
}

/**
 * Takes back the last move: restores every sheet and gives the turn back to
 * the player who made it. Returns the new game, or null if there is nothing to undo.
 */
export function undoMove(game) {
  if (!canUndo(game)) return null
  const last = game.history[game.history.length - 1]
  const next = JSON.parse(JSON.stringify(game))
  next.players.forEach((p, i) => { p.sheet = JSON.parse(JSON.stringify(last.sheets[i])) })
  next.curIdx  = last.curIdx
  next.phase   = 'pass'
  next.history = next.history.slice(0, -1)
  return next
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

function scoreForRow(rowId, vals, freq, counts, sum, unique, mode, rules, roll) {
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
    case 'str':     return straightScore(vals, rules, roll)
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

/**
 * Up to eight best open cells for the dice. options.rules are the Yamb house
 * rules, options.roll the current roll number (it matters for the straight).
 */
export function getSuggestions(diceVals, sheet, mode, najava, { rules = DEFAULT_RULES, roll = null } = {}) {
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
        const score = scoreForRow(row.id, vals, freq, counts, sum, unique, mode, rules, roll)
        if (score === null || score === 0) return
        results.push({ label: `${col.full}: ${row.name}`, colId: col.id, rowId: row.id, score })
      })
    })
  } else {
    getRows(mode).forEach(row => {
      if (getCell(sheet, mode, null, row.id) !== null) return
      const score = scoreForRow(row.id, vals, freq, counts, sum, unique, mode, rules, roll)
      if (score === null || score === 0) return
      results.push({ label: row.name, colId: 'free', rowId: row.id, score })
    })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 8)
}
