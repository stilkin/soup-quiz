import * as SQLite from 'expo-sqlite'

/**
 * Versioned migrations, guarded by PRAGMA user_version (design D3: plain SQL, no ORM,
 * no external migration tool). Append a new statement array to add a migration — never
 * edit an executed one.
 */
const MIGRATIONS: readonly string[] = [
  `CREATE TABLE rounds (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     kind TEXT NOT NULL DEFAULT 'free',
     mode_id TEXT NOT NULL,
     seed TEXT NOT NULL,
     length INTEGER NOT NULL,
     correct INTEGER NOT NULL,
     finished_at INTEGER NOT NULL
   );
   CREATE TABLE answers (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     round_id INTEGER NOT NULL REFERENCES rounds(id),
     item_id TEXT NOT NULL,
     correct INTEGER NOT NULL,
     answered_at INTEGER NOT NULL
   );
   CREATE INDEX answers_item_id ON answers(item_id);`,
]

let dbPromise: Promise<SQLite.SQLiteDatabase> | undefined

/** Lazily opened singleton connection, migrated to the latest version. */
export function getStatsDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= open()
  return dbPromise
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('stats.db')
  await db.execAsync('PRAGMA journal_mode = WAL;')
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version')
  const from = versionRow?.user_version ?? 0
  for (let v = from; v < MIGRATIONS.length; v++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[v])
      await db.execAsync(`PRAGMA user_version = ${v + 1};`)
    })
  }
  return db
}
