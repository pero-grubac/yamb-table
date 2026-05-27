import { YAMB_ROWS, YAMB_COLS, YAHTZEE_ROWS, YATZY_ROWS } from '../constants'

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
 * Creates the initial game state.
 */
export function createGame(playerNames, mode) {
  return {
    players: playerNames.map(name => createPlayer(name, mode)),
    mode,
    curIdx: 0,
    phase: 'pass',
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
