const { getDefaultConfig } = require('expo/metro-config')

// @ts-check
const config = getDefaultConfig(__dirname)

// expo-sqlite's web backend imports wa-sqlite.wasm as a module asset — Metro
// resolves it only when 'wasm' is an asset extension (Expo SDK 57 docs, "SQLite
// on web"). The serving side also needs COOP/COEP headers; see
// scripts/gen-store-screens.mjs.
config.resolver.assetExts.push('wasm')

module.exports = config
