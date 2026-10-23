import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptySheet, createGame, setCell, getCell, normalizeRules, normalizeGame } from '../src/models/gameModel.js'
import {
  calcUpper, calcBonus, calcColTotal, calcGrand,
  nextCellForCol, isCellEditable, isPlayerDone, applyTurn, getSuggestions,
  straightScore, yambRowHint, bonusLabel, playTurn, undoMove, canUndo,
} from '../src/services/gameService.js'
import { YAMB_ROWS, YAMB_COLS, YAHTZEE_ROWS, DEFAULT_RULES, UNDO_LIMIT } from '../src/constants/index.js'

test('a new game starts with empty sheets and the first player', () => {
  const game = createGame(['Ana', 'Marko'], 'yamb')
  assert.equal(game.players.length, 2)
  assert.equal(game.curIdx, 0)
  assert.equal(getCell(game.players[0].sheet, 'yamb', 'dolje', 'ones'), null)
  assert.equal(Object.keys(emptySheet('yahtzee')).length, YAHTZEE_ROWS.length)
})

test('setCell does not mutate the original sheet', () => {
  const sheet = emptySheet('yamb')
  const next = setCell(sheet, 'yamb', 'gore', 'sixes', 24)
  assert.equal(getCell(sheet, 'yamb', 'gore', 'sixes'), null)
  assert.equal(getCell(next, 'yamb', 'gore', 'sixes'), 24)
})

test('DOLJE fills top to bottom, GORE bottom to top', () => {
  let sheet = emptySheet('yamb')
  assert.equal(nextCellForCol(sheet, 'dolje'), 'ones')
  assert.equal(nextCellForCol(sheet, 'gore'), 'chance')
  assert.equal(isCellEditable(sheet, 'yamb', 'dolje', 'twos', null), false)
  sheet = setCell(sheet, 'yamb', 'dolje', 'ones', 3)
  assert.equal(isCellEditable(sheet, 'yamb', 'dolje', 'twos', null), true)
  assert.equal(nextCellForCol(sheet, 'dolje'), 'twos')
})

test('SLOBODNO is always open, NAJAVA only for the announced cell', () => {
  const sheet = emptySheet('yamb')
  assert.equal(isCellEditable(sheet, 'yamb', 'slobodno', 'poker', null), true)
  assert.equal(isCellEditable(sheet, 'yamb', 'najava', 'yamb', null), false)
  assert.equal(isCellEditable(sheet, 'yamb', 'najava', 'yamb', { colId: 'najava', rowId: 'yamb' }), true)
})

test('Yamb totals: upper, (max − min) × 10 bonus, column and grand total', () => {
  let sheet = emptySheet('yamb')
  sheet = setCell(sheet, 'yamb', 'slobodno', 'sixes', 18)
  sheet = setCell(sheet, 'yamb', 'slobodno', 'max', 27)
  sheet = setCell(sheet, 'yamb', 'slobodno', 'min', 9)
  sheet = setCell(sheet, 'yamb', 'slobodno', 'yamb', 50)
  assert.equal(calcUpper(sheet, 'yamb', 'slobodno'), 18)
  assert.equal(calcBonus(sheet, 'yamb', 'slobodno'), 180)
  assert.equal(calcColTotal(sheet, 'yamb', 'slobodno'), 18 + 36 + 50 + 180)
  assert.equal(calcGrand(sheet, 'yamb'), calcColTotal(sheet, 'yamb', 'slobodno'))
})

test('Yahtzee upper bonus is 35 at 63+', () => {
  let sheet = emptySheet('yahtzee')
  ;[['ones', 3], ['twos', 6], ['threes', 9], ['fours', 12], ['fives', 15], ['sixes', 18]]
    .forEach(([row, v]) => { sheet = setCell(sheet, 'yahtzee', null, row, v) })
  assert.equal(calcBonus(sheet, 'yahtzee', null), 35)
  assert.equal(calcBonus(sheet, 'yatzy', null), 50)
})

test('a player is done when every cell is filled', () => {
  let sheet = emptySheet('yamb')
  assert.equal(isPlayerDone(sheet, 'yamb'), false)
  for (const col of YAMB_COLS) for (const row of YAMB_ROWS) sheet = setCell(sheet, 'yamb', col.id, row.id, 0)
  assert.equal(isPlayerDone(sheet, 'yamb'), true)
})

test('applyTurn: one SLOBODNO field per turn, blanks become 0, an unfilled NAJAVA is sacrificed', () => {
  const sheet = emptySheet('yamb')
  assert.match(applyTurn(sheet, 'yamb', { slobodno_ones: '3', slobodno_twos: '4' }, null).error, /SAMO JEDNO/)

  const { newSheet, error } = applyTurn(sheet, 'yamb', { dolje_ones: '', slobodno_fives: '15' }, { colId: 'najava', rowId: 'poker' })
  assert.equal(error, null)
  assert.equal(newSheet.dolje.ones, 0)
  assert.equal(newSheet.slobodno.fives, 15)
  assert.equal(newSheet.najava.poker, 0)
  assert.equal(sheet.dolje.ones, null, 'original sheet untouched')
})

test('applyTurn for Yahtzee needs exactly one new category', () => {
  const sheet = setCell(emptySheet('yahtzee'), 'yahtzee', null, 'chance', 20)
  assert.match(applyTurn(sheet, 'yahtzee', {}, null).error, /JEDNU/)
  assert.match(applyTurn(sheet, 'yahtzee', { free_ones: '1', free_twos: '2' }, null).error, /SAMO JEDNA/)
  assert.match(applyTurn(sheet, 'yahtzee', { free_chance: '22' }, null).error, /VEĆ UPISANA/)
  assert.equal(applyTurn(sheet, 'yahtzee', { free_yahtzee: '50' }, null).newSheet.yahtzee, 50)
})

test('suggestions rank the best open categories for the dice', () => {
  const yahtzee = getSuggestions([6, 6, 6, 6, 6], emptySheet('yahtzee'), 'yahtzee', null)
  assert.equal(yahtzee[0].rowId, 'yahtzee')
  assert.equal(yahtzee[0].score, 50)

  const full = getSuggestions([2, 2, 3, 3, 3], emptySheet('yahtzee'), 'yahtzee', null)
  assert.ok(full.some((s) => s.rowId === 'fhouse' && s.score === 25))

  const straight = getSuggestions([2, 3, 4, 5, 6], emptySheet('yahtzee'), 'yahtzee', null)
  assert.ok(straight.some((s) => s.rowId === 'lstr' && s.score === 40))

  assert.deepEqual(getSuggestions([null, null], emptySheet('yamb'), 'yamb', null), [])
})

/* ── House rules: straight (kenta) ── */

const STR_ROW = YAMB_ROWS.find(r => r.id === 'str')

test('straight, default rule: 66 in the first roll, 45 later (both 1-5 and 2-6)', () => {
  const rules = { straight: 'firstRoll' }
  assert.equal(straightScore([1, 2, 3, 4, 5], rules, 1), 66)
  assert.equal(straightScore([6, 2, 5, 3, 4], rules, 1), 66)
  assert.equal(straightScore([1, 2, 3, 4, 5], rules, 2), 45)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, 3), 45)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, null), 45, 'unknown roll counts as a later roll')
  assert.equal(straightScore([2, 3, 4, 5, 6]), 45, 'defaults to the first-roll rule')
  assert.equal(straightScore([1, 2, 3, 4, 6], rules, 1), null)
  assert.equal(straightScore([1, 2, 3, 4, null], rules, 1), null)
})

test('straight, per-roll rule: 66 / 56 / 46', () => {
  const rules = { straight: 'perRoll' }
  assert.equal(straightScore([1, 2, 3, 4, 5], rules, 1), 66)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, 2), 56)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, 3), 46)
  assert.equal(straightScore([3, 3, 4, 5, 6], rules, 1), null)
})

test('straight, small/large rule: 1-5 is 35, 2-6 is 45, whatever the roll', () => {
  const rules = { straight: 'smallLarge' }
  assert.equal(straightScore([5, 4, 3, 2, 1], rules, 1), 35)
  assert.equal(straightScore([1, 2, 3, 4, 5], rules, 3), 35)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, 1), 45)
  assert.equal(straightScore([2, 3, 4, 5, 6], rules, 2), 45)
})

test('Yamb suggestions score the straight with the chosen rule and the current roll', () => {
  const sheet = emptySheet('yamb')
  const strOf = (rules, roll) =>
    getSuggestions([2, 3, 4, 5, 6], sheet, 'yamb', null, { rules, roll }).find(s => s.colId === 'slobodno' && s.rowId === 'str')?.score

  // regression: a 2-6 straight in the first roll used to give 45
  assert.equal(strOf(DEFAULT_RULES, 1), 66)
  assert.equal(strOf(DEFAULT_RULES, 2), 45)
  assert.equal(strOf({ straight: 'perRoll' }, 2), 56)
  assert.equal(strOf({ straight: 'smallLarge' }, 1), 45)
  const small = getSuggestions([1, 2, 3, 4, 5], sheet, 'yamb', null, { rules: { straight: 'smallLarge' }, roll: 1 })
  assert.equal(small.find(s => s.rowId === 'str').score, 35)
})

test('the STRAIGHT row hint follows the chosen rule', () => {
  assert.equal(yambRowHint(STR_ROW, DEFAULT_RULES), '66 / 45 pts')
  assert.equal(yambRowHint(STR_ROW, { straight: 'perRoll' }), '66 / 56 / 46 pts')
  assert.match(yambRowHint(STR_ROW, { straight: 'smallLarge' }), /35.*45/)
  assert.equal(yambRowHint(YAMB_ROWS[0], { straight: 'perRoll' }), YAMB_ROWS[0].hint)
})

/* ── House rules: MAX/MIN bonus ── */

function maxMinSheet(ones) {
  let sheet = emptySheet('yamb')
  sheet = setCell(sheet, 'yamb', 'dolje', 'max', 27)
  sheet = setCell(sheet, 'yamb', 'dolje', 'min', 9)
  if (ones !== undefined) sheet = setCell(sheet, 'yamb', 'dolje', 'ones', ones)
  return sheet
}

test('bonus (MAX − MIN) × 10 is the default and ignores the ones', () => {
  assert.equal(calcBonus(maxMinSheet(3), 'yamb', 'dolje'), 180)
  assert.equal(calcBonus(maxMinSheet(3), 'yamb', 'dolje', { bonus: 'times10' }), 180)
  assert.equal(bonusLabel(DEFAULT_RULES), '(M−m)×10')
})

test('bonus (MAX − MIN) × number of ones in the column', () => {
  const rules = { bonus: 'timesOnes' }
  assert.equal(calcBonus(maxMinSheet(3), 'yamb', 'dolje', rules), 54)
  assert.equal(calcBonus(maxMinSheet(5), 'yamb', 'dolje', rules), 90)
  assert.equal(calcBonus(maxMinSheet(0), 'yamb', 'dolje', rules), 0)
  assert.equal(calcBonus(maxMinSheet(), 'yamb', 'dolje', rules), 0, 'ones not filled yet count as 0')
  assert.equal(calcColTotal(maxMinSheet(3), 'yamb', 'dolje', rules), 3 + 36 + 54)
  assert.equal(calcGrand(maxMinSheet(3), 'yamb', rules), 3 + 36 + 54)
  assert.equal(bonusLabel(rules), '(M−m)×JED.')
})

test('rules are normalized: new games get defaults, old saves get rules and an empty history', () => {
  assert.deepEqual(createGame(['A', 'B'], 'yamb').rules, DEFAULT_RULES)
  assert.deepEqual(createGame(['A', 'B'], 'yamb', { straight: 'perRoll', bonus: 'timesOnes' }).rules, { straight: 'perRoll', bonus: 'timesOnes' })
  assert.deepEqual(normalizeRules({ straight: 'nope' }), DEFAULT_RULES)

  const old = { players: [{ name: 'A', sheet: emptySheet('yamb') }], mode: 'yamb', curIdx: 0, phase: 'pass' }
  const loaded = normalizeGame(old)
  assert.deepEqual(loaded.rules, DEFAULT_RULES)
  assert.deepEqual(loaded.history, [])
  assert.equal(old.rules, undefined, 'the saved object is not mutated')
})

/* ── Turns and undo ── */

test('playTurn saves the sheet, records history and passes the turn on', () => {
  const game = createGame(['Ana', 'Marko'], 'yahtzee')
  const { game: next, error } = playTurn(game, 0, { free_chance: '20' }, null)
  assert.equal(error, null)
  assert.equal(next.players[0].sheet.chance, 20)
  assert.equal(next.curIdx, 1)
  assert.equal(next.phase, 'pass')
  assert.equal(next.history.length, 1)
  assert.equal(game.players[0].sheet.chance, null, 'input game untouched')
  assert.equal(canUndo(game), false)
  assert.equal(canUndo(next), true)

  const bad = playTurn(next, 1, {}, null)
  assert.match(bad.error, /JEDNU/)
  assert.equal(bad.game, null)
})

test('undoMove restores the previous sheet and gives the turn back', () => {
  let game = createGame(['Ana', 'Marko'], 'yamb')
  game = playTurn(game, 0, { slobodno_sixes: '24' }, null).game
  game = playTurn(game, 1, { dolje_ones: '3' }, null).game
  assert.equal(game.curIdx, 0)

  const once = undoMove(game)
  assert.equal(once.curIdx, 1)
  assert.equal(once.phase, 'pass')
  assert.equal(once.players[1].sheet.dolje.ones, null)
  assert.equal(once.players[0].sheet.slobodno.sixes, 24)
  assert.equal(once.history.length, 1)
  assert.equal(game.players[1].sheet.dolje.ones, 3, 'input game untouched')

  const twice = undoMove(once)
  assert.equal(twice.curIdx, 0)
  assert.equal(twice.players[0].sheet.slobodno.sixes, null)
  assert.equal(undoMove(twice), null, 'nothing left to undo')
  assert.equal(undoMove(normalizeGame({ players: [{ name: 'A', sheet: {} }] })), null)
})

test('history keeps only the last moves and undo works from the winner screen', () => {
  let game = createGame(['Solo'], 'yahtzee')
  YAHTZEE_ROWS.forEach(row => { game = playTurn(game, 0, { [`free_${row.id}`]: '1' }, null).game })
  assert.equal(game.phase, 'winner')
  assert.equal(game.history.length, UNDO_LIMIT)

  const back = undoMove(game)
  assert.equal(back.phase, 'pass')
  assert.equal(back.players[0].sheet[YAHTZEE_ROWS.at(-1).id], null)
  assert.equal(isPlayerDone(back.players[0].sheet, 'yahtzee'), false)
})
