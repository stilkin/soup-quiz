/**
 * Renders the App Store screenshot sets from the web export (add-store-release
 * design D9): a tiny static server with SPA fallback — plus the COOP/COEP headers
 * expo-sqlite's wa-sqlite/OPFS web backend needs — and playwright-core with system
 * Chromium at the exact required device viewports:
 *
 *   iPhone Dynamic Island medium: 393x852 CSS px @ deviceScaleFactor 3 -> 1179x2556
 *   iPad 13":                    1032x1376 CSS px @ deviceScaleFactor 2 -> 2064x2752
 *
 * deviceScaleFactor does the pixel math, so page.screenshot() equals Apple's
 * physical size exactly. Scenes are driven through the real UI (taps by accessible
 * label, waits on real text, deliberate settle times) in fresh contexts, so every
 * shot is the app as a player sees it.
 *
 * Today's daily is computed with the engine's own rng (imported straight from
 * packages/engine/src) plus the selection rules mirrored from daily.ts — the
 * solved scene waits for "Solved on clue 1", which fails loudly if they drift.
 *
 * Prerequisite: a current web export in dist/ (pnpm exec expo export -p web).
 * Usage: node scripts/gen-store-screens.mjs           (Apple sets — the default)
 *        PLAY=1 node scripts/gen-store-screens.mjs    (Play phone set, see DEVICES)
 * CHROMIUM_PATH overrides the browser.
 */
import { mkdir, readFile, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { chromium } from 'playwright-core'
import soups from '../../../packages/data/src/soups.v1.json' with { type: 'json' }
import { createRng } from '../../../packages/engine/src/rng.ts'
import { countryName } from '../../../packages/schema/src/registries.ts'

const DIST = 'dist'
const PLAY = process.env.PLAY === '1'
const OUT = PLAY ? 'assets/store-listing/android' : 'assets/store-listing/ios'
const CHROMIUM = process.env.CHROMIUM_PATH ?? '/usr/bin/chromium-browser'

/** deviceScaleFactor does the heavy lifting: CSS viewport x scale = exact store pixels */
const DEVICES = PLAY
  ? // Play caps screenshots at 2:1 (max side <= 2x min side), so the phone set
    // renders 393x786 CSS px @3x = 1179x2358 — exactly on the cap.
    [{ name: 'play-phone', width: 393, height: 786, scale: 3 }]
  : [
      { name: 'iphone', width: 393, height: 852, scale: 3 },
      { name: 'ipad', width: 1032, height: 1376, scale: 2 },
    ]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.wasm': 'application/wasm',
}

/** Serves the static export with SPA fallback (/daily -> daily.html) and the
 * cross-origin isolation headers wa-sqlite's OPFS backend requires. */
function serveDist(root) {
  const server = createServer(async (req, res) => {
    const headers = {
      'cross-origin-opener-policy': 'same-origin',
      'cross-origin-embedder-policy': 'require-corp',
    }
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
      let file = normalize(join(root, urlPath))
      if (urlPath.endsWith('/')) file = join(file, 'index.html')
      let data
      try {
        data = await readFile(file)
      } catch {
        file = `${file}.html` // static-export route fallback — keep the extension for MIME
        data = await readFile(file)
      }
      res.writeHead(200, {
        ...headers,
        'content-type': MIME[extname(file)] ?? 'application/octet-stream',
      })
      res.end(data)
    } catch {
      res.writeHead(404, headers)
      res.end('not found')
    }
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

/** Today's daily item — mirrors dailyPool/dailyForDay from packages/engine/src/daily.ts. */
function todayDaily() {
  const pool = soups
    .filter((item) => item.image !== undefined && item.ingredients.length >= 2)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const dayIndex = Math.floor(Date.now() / 86_400_000)
  const cycle = Math.floor(dayIndex / pool.length)
  const order = createRng(`daily-cycle-${cycle}`).shuffle(pool)
  return order[dayIndex % order.length]
}

let BASE = '' // set in main() once the server is up

async function openApp(browser, device, route) {
  const context = await browser.newContext({
    viewport: { width: device.width, height: device.height },
    deviceScaleFactor: device.scale,
  })
  const page = await context.newPage()
  // surface the app's own warnings (storage failures land here as console.warn)
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') {
      console.error(`[page ${device.name}] ${message.text().slice(0, 200)}`)
    }
  })
  await page.goto(`${BASE}${route}`, { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400) // settle animations
  return { context, page }
}

const shot = (page, name) => page.screenshot({ path: join(OUT, name) })

/** Commits a country guess through the real answer box: type a prefix, tap the
 * suggestion. Typing never spends a guess — the tap commits. */
async function commitCountry(page, code) {
  const name = countryName(code)
  await page.getByLabel('Country guess').fill(name.slice(0, 5).toLowerCase())
  await page.getByRole('button', { name, exact: true }).click()
}

/** Answers the current question (first option); waits for the reveal card.
 * ':visible' because the Stack keeps earlier screens mounted but hidden. */
async function answerCurrent(page) {
  await page.locator('[role="button"]:visible').first().click()
  await page.getByText('Read more on Wikipedia').first().waitFor({ timeout: 10_000 })
  await page.waitForTimeout(400) // let the state colors land
}

/** Plays on until the round ends and the score screen renders. */
async function finishRound(page) {
  for (let guard = 0; guard < 12; guard++) {
    if ((await page.getByText("Tonight's tasting").count()) > 0) return
    const next = page.getByRole('button', { name: /Next soup|See the score/ })
    if ((await next.count()) === 0) {
      await answerCurrent(page)
      continue
    }
    await next.click()
    if ((await page.getByText("Tonight's tasting").count()) === 0) {
      await page.getByText("What's in the bowl?").waitFor({ timeout: 10_000 })
    }
  }
  throw new Error('round did not finish within the guard budget')
}

/** Scenes 2-3 + 6 share one context: menu -> play a round -> stats of that round. */
async function playFlowScenes(browser, device) {
  // 2 — free-play question, fresh and un-answered
  const { context, page } = await openApp(browser, device, '/')
  await page.getByText('Your stats').waitFor({ timeout: 10_000 })
  await page.getByText('Read the ingredients').click() // the quiz menu tile
  await page.getByText("What's in the bowl?").waitFor({ timeout: 10_000 })
  await page.waitForTimeout(600)
  await shot(page, `${device.name}-02-question.png`)

  // 3 — answered: feedback colors + the reveal card (retry until the revealed
  // soup ships an image, so the attribution row is in frame)
  let revealedWithImage = false
  for (let question = 0; question < 5; question++) {
    await answerCurrent(page)
    if ((await page.locator('img').count()) > 0) {
      revealedWithImage = true
      break
    }
    if (question < 4) {
      await page.getByRole('button', { name: /Next soup|See the score/ }).click()
      await page.getByText("What's in the bowl?").waitFor({ timeout: 10_000 })
    }
  }
  if (!revealedWithImage) {
    throw new Error('no imaged soup in this round — rerun for a new random round')
  }
  await page.waitForTimeout(2200) // reveal card's spring settle
  await shot(page, `${device.name}-03-answered.png`)

  // 6 — stats populated by this very round (the storage round-trip is in the shot)
  await finishRound(page)
  await page.waitForTimeout(1500) // recordRound is fire-and-forget — let it commit
  await page.goto(`${BASE}/stats`, { waitUntil: 'load' })
  await page.getByText('Buy me a drink').waitFor({ timeout: 10_000 }) // populated branch
  await page.waitForTimeout(600)
  await shot(page, `${device.name}-06-stats.png`)

  await context.close()
}

/** Scenes 4-5: the daily ladder mid-play, then solved on the first clue. */
async function dailyScenes(browser, device) {
  const daily = todayDaily()
  const wrongs = ['BE', 'JP', 'MA', 'PE']
    .filter((code) => !daily.countries.includes(code))
    .slice(0, 2)

  // 4 — two committed wrong guesses: heat feedback + clues through tier 3
  {
    const { context, page } = await openApp(browser, device, '/daily')
    await page.getByText("Today's soup").waitFor({ timeout: 10_000 })
    // the screen's on-focus refresh (a sqlite round-trip) resets the board when it
    // lands — let it settle before committing, or the first guess gets wiped
    await page.waitForTimeout(2000)
    await commitCountry(page, wrongs[0])
    await page.getByText('Clue 2 of 4').waitFor({ timeout: 10_000 })
    await commitCountry(page, wrongs[1])
    await page.getByText('Clue 3 of 4').waitFor({ timeout: 10_000 })
    // no-op at Apple sizes; on the shorter Play viewport it pulls the ladder into frame
    await page.getByText('Clue 3 of 4').scrollIntoViewIfNeeded()
    await page.waitForTimeout(600)
    await shot(page, `${device.name}-04-daily-mid.png`)
    await context.close()
  }

  // 5 — solved on clue 1: outcome card + credited reveal
  {
    const { context, page } = await openApp(browser, device, '/daily')
    await page.getByText("Today's soup").waitFor({ timeout: 10_000 })
    await page.waitForTimeout(2000) // same on-focus refresh as above
    await commitCountry(page, daily.countries[0])
    await page.getByText('Solved on clue 1 of 4').waitFor({ timeout: 10_000 })
    await page.locator('img').first().waitFor({ timeout: 10_000 })
    await page.waitForTimeout(2200) // reveal card's spring settle
    await shot(page, `${device.name}-05-daily-solved.png`)
    await context.close()
  }
}

async function main() {
  await stat(join(DIST, 'index.html')) // fail loudly if the export is missing
  await mkdir(OUT, { recursive: true })

  const server = await serveDist(DIST)
  BASE = `http://127.0.0.1:${server.address().port}`

  const browser = await chromium.launch({ executablePath: CHROMIUM })
  try {
    for (const device of DEVICES) {
      // 1 — the menu, fresh install
      {
        const { context, page } = await openApp(browser, device, '/')
        await page.getByText('Your stats').waitFor({ timeout: 10_000 })
        await page.waitForTimeout(400)
        await shot(page, `${device.name}-01-menu.png`)
        await context.close()
      }
      await playFlowScenes(browser, device)
      await dailyScenes(browser, device)
      console.log(`${device.name}: 6 screenshots -> ${OUT}`)
    }
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
