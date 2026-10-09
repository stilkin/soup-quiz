/**
 * Uploads the generated App Store screenshots via the ASC API's documented flow
 * (add-store-release design D8/D9): ensure a screenshot set per display type on
 * the en-GB version localization, then per image — reserve a slot, PUT the bytes
 * to Apple's signed upload operations, commit with {uploaded:true}.
 *
 * No retries by design (the careful-API rules): any unexpected status prints the
 * response and stops the run. Refuses to touch a set that already holds
 * screenshots, so re-runs never duplicate past the 10-per-set limit.
 *
 * Credentials (env): ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER — the key is never
 * printed or committed. Every API call appends a line to $ASC_RUN_SHEET if set.
 *
 * Usage: node scripts/asc-upload-screens.mjs
 */

import { sign as cryptoSign } from 'node:crypto'
import { appendFileSync, readFileSync, statSync } from 'node:fs'

const API = 'https://api.appstoreconnect.apple.com'
const VERSION_ID = '5476451a-bd24-44dc-87b2-084bc8d8bf54' // editable 1.0.0, iOS
const DIR = 'assets/store-listing/ios'
const SETS = [
  { displayType: 'APP_IPHONE_61', prefix: 'iphone' }, // Dynamic Island medium, 1179x2556
  { displayType: 'APP_IPAD_PRO_3GEN_129', prefix: 'ipad' }, // iPad 13", 2064x2752
]
const SCENES = ['menu', 'question', 'answered', 'daily-mid', 'daily-solved', 'stats']

const KEY_PATH = process.env.ASC_KEY_PATH
const KEY_ID = process.env.ASC_KEY_ID
const ISSUER = process.env.ASC_ISSUER
const RUN_SHEET = process.env.ASC_RUN_SHEET

if (!KEY_PATH || !KEY_ID || !ISSUER) {
  console.error('Need ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER in the environment')
  process.exit(1)
}

const b64u = (buf) => Buffer.from(buf).toString('base64url')

let token = '' // minted lazily, reused for the whole run (well under 20 minutes)
function mintToken() {
  if (token) return token
  const key = readFileSync(KEY_PATH, 'utf8')
  const now = Math.floor(Date.now() / 1000)
  const header = b64u(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' }))
  const payload = b64u(
    JSON.stringify({ iss: ISSUER, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' }),
  )
  // ieee-p1363 = the raw r||s JWS signature, no DER walk needed
  const sig = cryptoSign('sha256', Buffer.from(`${header}.${payload}`), {
    key,
    dsaEncoding: 'ieee-p1363',
  })
  token = `${header}.${payload}.${b64u(sig)}`
  return token
}

async function ascFetch(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${mintToken()}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  const parsed = text ? JSON.parse(text) : {}
  if (RUN_SHEET)
    appendFileSync(RUN_SHEET, `${new Date().toISOString()} ${method} ${path} -> ${res.status}\n`)
  if (res.status >= 400) {
    console.error(`${method} ${path} -> ${res.status}`)
    console.error(JSON.stringify(parsed).slice(0, 600))
    throw new Error(`unexpected ${res.status} — stopping, no retries by design`)
  }
  return parsed
}

async function localizationId() {
  const body = await ascFetch(
    'GET',
    `/v1/appStoreVersions/${VERSION_ID}/appStoreVersionLocalizations?fields[appStoreVersionLocalizations]=locale`,
  )
  const loc = body.data.find((l) => l.attributes.locale === 'en-GB')
  if (!loc) throw new Error('no en-GB version localization found')
  return loc.id
}

/** Reuses the set for a display type if it exists; refuses if it holds images. */
async function ensureSet(locId, displayType) {
  const body = await ascFetch(
    'GET',
    `/v1/appStoreVersionLocalizations/${locId}/appScreenshotSets?filter[screenshotDisplayType]=${displayType}&include=appScreenshots&limit=1`,
  )
  const existing = body.data[0]
  if (existing) {
    const shots = body.included?.filter((r) => r.type === 'appScreenshots') ?? []
    if (shots.length > 0) {
      throw new Error(
        `set ${displayType} already holds ${shots.length} screenshots — delete them in App Store Connect to re-upload`,
      )
    }
    return existing.id
  }
  const created = await ascFetch('POST', '/v1/appScreenshotSets', {
    data: {
      type: 'appScreenshotSets',
      attributes: { screenshotDisplayType: displayType },
      relationships: {
        appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: locId } },
      },
    },
  })
  return created.data.id
}

/** Reserve -> PUT the bytes per signed operation (chunk-aware) -> commit. */
async function uploadImage(setId, path, fileName) {
  const fileSize = statSync(path).size
  const reserved = await ascFetch('POST', '/v1/appScreenshots', {
    data: {
      type: 'appScreenshots',
      attributes: { fileName, fileSize },
      relationships: { appScreenshotSet: { data: { type: 'appScreenshotSets', id: setId } } },
    },
  })
  const shot = reserved.data
  const bytes = readFileSync(path)
  for (const op of shot.attributes.uploadOperations ?? []) {
    const chunk = bytes.subarray(op.offset ?? 0, (op.offset ?? 0) + op.length)
    const headers = Object.fromEntries((op.requestHeaders ?? []).map((h) => [h.name, h.value]))
    const res = await fetch(op.url, { method: op.method, headers, body: chunk })
    console.log(
      `${res.status} ${op.method} ${fileName} [+${op.offset ?? 0}..${(op.offset ?? 0) + op.length}]`,
    )
    if (res.status >= 400) {
      console.error((await res.text()).slice(0, 400))
      throw new Error(`upload failed for ${fileName} — stopping, no retries by design`)
    }
  }
  await ascFetch('PATCH', `/v1/appScreenshots/${shot.id}`, {
    data: { type: 'appScreenshots', id: shot.id, attributes: { uploaded: true } },
  })
}

async function main() {
  const locId = await localizationId()
  const setIds = []
  for (const { displayType, prefix } of SETS) {
    const setId = await ensureSet(locId, displayType)
    setIds.push({ displayType, setId })
    console.log(`set ${displayType}: ${setId}`)
    for (let i = 0; i < SCENES.length; i++) {
      const scene = SCENES[i]
      const name = `${prefix}-0${i + 1}.png` // canonical short name on Apple's side
      await uploadImage(setId, `${DIR}/${prefix}-0${i + 1}-${scene}.png`, name)
    }
  }
  // read-back (GET_INSTANCE — this key has no GET_COLLECTION on sets): both sets
  // should show six screenshots, each uploaded and delivered
  for (const { displayType, setId } of setIds) {
    const body = await ascFetch('GET', `/v1/appScreenshotSets/${setId}?include=appScreenshots`)
    const shots = body.included?.filter((r) => r.type === 'appScreenshots') ?? []
    const delivered = shots.filter((s) => s.attributes.assetDeliveryState?.state === 'COMPLETE')
    console.log(`${displayType}: ${shots.length} screenshots (${delivered.length} delivered)`)
  }
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
