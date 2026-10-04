import type { RoundRow } from './types'

/** UTC calendar day of a Unix-ms timestamp, e.g. '2026-10-02' (locked decision: UTC). */
export function utcDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10)
}

function consecutiveRuns(days: string[]): number[] {
  const runs: number[] = []
  let run = 0
  let previous: string | undefined
  for (const day of days) {
    if (previous !== undefined && nextUtcDay(previous) === day) {
      run += 1
    } else {
      run = 1
    }
    runs.push(run)
    previous = day
  }
  return runs
}

function nextUtcDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return utcDay(Date.UTC(y, m - 1, d + 1))
}

/**
 * Day streaks over finished rounds: a day counts when at least one round finished on
 * that UTC day. Current is the run ending today — or yesterday, so an alive streak is
 * not lost before the UTC day ends; best is the historical maximum.
 */
export function dayStreaks(
  rounds: readonly RoundRow[],
  now: number,
): { current: number; best: number } {
  if (rounds.length === 0) return { current: 0, best: 0 }

  const days = [...new Set(rounds.map((round) => utcDay(round.finished_at)))].sort()
  const runs = consecutiveRuns(days)
  const best = Math.max(...runs)

  const today = utcDay(now)
  const yesterday = utcDay(now - 86_400_000)
  const lastDay = days[days.length - 1]
  const current = lastDay === today || lastDay === yesterday ? runs[runs.length - 1] : 0

  return { current, best }
}

/**
 * Daily-challenge streaks: a day counts only when that day's daily was solved
 * (correct carries the solving tier, 0 for a failed day). Wordle semantics, kept
 * independent of the any-round streak above.
 */
export function dailyStreaks(
  rounds: readonly RoundRow[],
  now: number,
): { current: number; best: number } {
  return dayStreaks(
    rounds.filter((round) => round.kind === 'daily' && round.correct >= 1),
    now,
  )
}
