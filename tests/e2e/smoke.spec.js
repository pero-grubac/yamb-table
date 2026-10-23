// End-to-end smoke tests for the main flows. `npm run test:e2e`
import { test, expect } from '@playwright/test'

// Dice are rolled with Math.random; a test pushes the faces it wants into
// window.__dice and every die takes the next one from that queue.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const random = Math.random
    window.__dice = []
    Math.random = () => (window.__dice.length ? (window.__dice.shift() - 1) / 6 + 0.01 : random())
  })

  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.errors = errors
})

test.afterEach(async ({ page }) => {
  expect(page.errors, 'no JavaScript errors').toEqual([])
})

const nextDice = (page, faces) => page.evaluate((f) => window.__dice.push(...f), faces)

async function setup(page, { mode = 'YAMB', players = ['Ana', 'Marko'] } = {}) {
  await page.goto('./')
  const name = page.getByPlaceholder('Ime igrača...')
  for (const p of players) {
    await name.fill(p)
    await name.press('Enter')
  }
  if (mode !== 'YAMB') await page.getByRole('button', { name: new RegExp(`^${mode}`) }).click()
}

async function startAndPlay(page) {
  await page.getByRole('button', { name: '▶ POČNI IGRU' }).click()
  await page.getByRole('button', { name: '▶ SPREMAN SAM' }).click()
}

const dieFaces = (page) =>
  page.getByRole('button', { name: /^Kockica/ }).evaluateAll((els) => els.map((e) => e.getAttribute('aria-label').split(': ')[1]))

test('setup: the Yamb rules panel picks the straight and bonus rules', async ({ page }) => {
  await setup(page)
  const panel = page.getByRole('button', { name: /Kenta:/ })
  await expect(panel).toContainText('66 / 45 pts')
  await expect(panel).toContainText('(M−m)×10')

  await panel.click()
  const perRoll = page.getByRole('radio', { name: /66 \/ 56 \/ 46 po bacanju/ })
  await perRoll.click()
  await page.getByRole('radio', { name: /broj jedinica/ }).click()
  await expect(perRoll).toHaveAttribute('aria-checked', 'true')
  await expect(panel).toContainText('66 / 56 / 46 pts')

  // the panel is for Yamb only
  await page.getByRole('button', { name: /^YAHTZEE/ }).click()
  await expect(panel).toBeHidden()
  await page.getByRole('button', { name: /^YAMB/ }).click()
  await expect(panel).toContainText('66 / 56 / 46 pts')

  await startAndPlay(page)
  await expect(page.getByText('66 / 56 / 46 pts')).toBeVisible()
  await expect(page.getByText('BONUS (M−m)×JED.')).toBeVisible()
})

test('dice: roll, hold and a straight suggestion that follows the roll number', async ({ page }) => {
  await setup(page)
  await startAndPlay(page)
  await page.getByRole('button', { name: /BACI KOCKICE/ }).click()

  await nextDice(page, [2, 3, 4, 5, 6])
  await page.getByRole('button', { name: '🎲 BACI SVE' }).click()
  await expect(page.getByRole('button', { name: 'SLOBODNO: STRAIGHT → 66' })).toBeVisible()

  // hold the first four, reroll the last one into a 1-5 straight in roll 2
  for (let i = 1; i <= 4; i++) await page.getByRole('button', { name: new RegExp(`^Kockica ${i}:`) }).click()
  await expect(page.getByText(/4 DRŽI/)).toBeVisible()
  await nextDice(page, [1])
  await page.getByRole('button', { name: '🎲 REBACI' }).click()
  expect(await dieFaces(page)).toEqual(['2', '3', '4', '5', '1'])
  await expect(page.getByText('BACANJE 2 OD 3')).toBeVisible()

  await page.getByRole('button', { name: 'SLOBODNO: STRAIGHT → 45' }).click()
  await expect(page.getByRole('spinbutton', { name: 'SLOBODNO STRAIGHT' })).toHaveValue('45')

  await page.getByRole('button', { name: 'ZAVRŠI RED' }).click()
  await expect(page.getByText('MARKO', { exact: true })).toBeVisible()
})

test('finish a turn, undo it, and resume the saved game after a reload', async ({ page }) => {
  await setup(page)
  await startAndPlay(page)
  await page.getByRole('spinbutton', { name: 'SLOBODNO 6' }).fill('24')
  await page.getByRole('button', { name: 'ZAVRŠI RED' }).click()
  await expect(page.getByText('MARKO', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: '↶ PONIŠTI POTEZ' }).click()
  await expect(page.getByText('PONIŠTI POTEZ?')).toBeVisible()
  await page.getByRole('button', { name: 'DA' }).click()
  await expect(page.getByText('ANA', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '↶ PONIŠTI POTEZ' })).toBeHidden()

  await page.getByRole('button', { name: '▶ SPREMAN SAM' }).click()
  await expect(page.getByRole('spinbutton', { name: 'SLOBODNO 6' })).toHaveValue('')
  await page.getByRole('spinbutton', { name: 'SLOBODNO 5' }).fill('20')
  await page.getByRole('button', { name: 'ZAVRŠI RED' }).click()
  await expect(page.getByText('MARKO', { exact: true })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: '▶ NASTAVI SAČUVANU IGRU' }).click()
  await expect(page.getByText('MARKO', { exact: true })).toBeVisible()
  // the undo history is saved with the game
  await expect(page.getByRole('button', { name: '↶ PONIŠTI POTEZ' })).toBeVisible()
})

test('Yahtzee: roll, take the suggestion and pass the turn', async ({ page }) => {
  await setup(page, { mode: 'YAHTZEE' })
  await expect(page.getByRole('button', { name: /Kenta:/ })).toBeHidden()
  await startAndPlay(page)
  await page.getByRole('button', { name: /BACI KOCKICE/ }).click()
  await nextDice(page, [6, 6, 6, 6, 6])
  await page.getByRole('button', { name: '🎲 BACI SVE' }).click()
  await page.getByRole('button', { name: 'YAHTZEE → 50' }).click()
  await expect(page.getByRole('spinbutton', { name: 'YAHTZEE' })).toHaveValue('50')
  await page.getByRole('button', { name: 'ZAVRŠI RED' }).click()
  await expect(page.getByText('MARKO', { exact: true })).toBeVisible()
})

test('works offline once loaded (service worker and self-hosted fonts)', async ({ page, context }) => {
  await page.goto('./')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('button', { name: '▶ POČNI IGRU' })).toBeVisible()
  const fontOk = await page.evaluate(async () => {
    await document.fonts.load('12px "Press Start 2P"')
    return document.fonts.check('12px "Press Start 2P"')
  })
  expect(fontOk).toBe(true)
  await context.setOffline(false)
})
