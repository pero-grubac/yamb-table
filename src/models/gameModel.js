import { YAMB_ROWS, YAMB_COLS, YAHTZEE_ROWS, YATZY_ROWS, STRAIGHT_RULES, BONUS_RULES, DEFAULT_RULES } from '../constants/index.js'

/**
 * Returns the correct row definitions for the given mode.
 */
export function getRows(mode) {
  if (mode === 'yamb')    return YAMB_ROWS
  if (mode === 'yatzy')   return YATZY_ROWS
  return YAHTZEE_ROWS
}

/**
 * Creates a blank score sheet for the given mode.
 * Yamb: { dolje: { ones: null, ... }, gore: {...}, ... }
 * Free: { ones: null, twos: null, ... }
 */
export function emptySheet(mode) {
  if (mode === 'yamb') {
    const sheet = {}
    YAMB_COLS.forEach(col => {
      sheet[col.id] = {}
      YAMB_ROWS.forEach(row => { sheet[col.id][row.id] = null })
    })
    return sheet
  }
  const sheet = {}
  getRows(mode).forEach(row => { sheet[row.id] = null })
  return sheet
}

/**
 * Creates a new player object.
 */
export function createPlayer(name, mode) {
  return { name, sheet: emptySheet(mode) }
}

/**
 * Returns a complete, valid rules object; unknown or missing values fall back to the defaults.
 */
export function normalizeRules(rules) {
  const straight = STRAIGHT_RULES.some(r => r.id === rules?.straight) ? rules.straight : DEFAULT_RULES.straight
  const bonus    = BONUS_RULES.some(r => r.id === rules?.bonus) ? rules.bonus : DEFAULT_RULES.bonus
  return { straight, bonus }
}

/**
 * Creates the initial game state.
 * history holds snapshots of earlier moves for undo (newest last).
 */
export function createGame(playerNames, mode, rules) {
  return {
    players: playerNames.map(name => createPlayer(name, mode)),
    mode,
    rules: normalizeRules(rules),
    curIdx: 0,
    phase: 'pass',
    history: [],
  }
}

/**
 * Brings a saved game up to the current shape (saves from older versions
 * have no rules and no history).
 */
export function normalizeGame(data) {
  return {
    ...data,
    rules: normalizeRules(data.rules),
    history: Array.isArray(data.history) ? data.history : [],
  }
}

/**
 * Get a cell value from a sheet.
 * For yamb: getCell(sheet, 'yamb', colId, rowId)
 * For free: getCell(sheet, mode, null, rowId)
 */
export function getCell(sheet, mode, colId, rowId) {
  if (mode === 'yamb') return sheet[colId]?.[rowId] ?? null
  return sheet[rowId] ?? null
}

/**
 * Returns an immutable copy of the sheet with a cell value set.
 */
export function setCell(sheet, mode, colId, rowId, value) {
  const next = JSON.parse(JSON.stringify(sheet))
  if (mode === 'yamb') {
    if (!next[colId]) next[colId] = {}
    next[colId][rowId] = value
  } else {
    next[rowId] = value
  }
  return next
}
