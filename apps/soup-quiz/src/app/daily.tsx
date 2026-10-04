import { soupsV1 } from '@soup-quiz/data'
import {
  DAILY_MODE_ID,
  DAILY_TIER_COUNT,
  dailyForDay,
  dayIndexFrom,
  isCorrect,
  LAUNCH_ANCHOR_DAY,
} from '@soup-quiz/engine'
import { countryName, distanceKm, heatBand } from '@soup-quiz/schema'
import { dailyStreaks } from '@soup-quiz/stats'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { RevealCard } from '../components/RevealCard'
import { SearchSelect } from '../components/SearchSelect'
import { soupImages } from '../images'
import { fetchDailyRound, fetchRounds, type RecordedAnswer, recordRound } from '../storage/repo'
import { colors, radius, spacing, type } from '../theme'

type Outcome = { status: 'unplayed' } | { status: 'solved'; tier: number } | { status: 'failed' }

/**
 * Soup of the day: one soup per UTC day for everyone. Clues arrive in four tiers —
 * photo, half the ingredients, the rest, the name — and each tier advance costs a
 * committed wrong guess, which always buys heat feedback.
 */
export default function DailyScreen() {
  const [now, setNow] = useState(() => Date.now())
  const [outcome, setOutcome] = useState<Outcome>({ status: 'unplayed' })
  const [tier, setTier] = useState(1)
  const [heat, setHeat] = useState<string | undefined>()
  const [streak, setStreak] = useState({ current: 0, best: 0 })
  const guesses = useRef<RecordedAnswer[]>([])

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const dayIndex = dayIndexFrom(now)
  const daily = useMemo(() => dailyForDay(soupsV1, dayIndex), [dayIndex])
  const dayNumber = dayIndex - LAUNCH_ANCHOR_DAY

  const lastSeed = useRef<string | undefined>(undefined)

  const refresh = useCallback(async () => {
    try {
      const [row, rounds] = await Promise.all([fetchDailyRound(daily.daySeed), fetchRounds()])
      // a new UTC day resets the board; refocusing mid-play keeps the open clues
      if (lastSeed.current !== daily.daySeed) {
        lastSeed.current = daily.daySeed
        guesses.current = []
        setTier(1)
        setHeat(undefined)
      }
      if (row) {
        setOutcome(row.correct > 0 ? { status: 'solved', tier: row.correct } : { status: 'failed' })
      } else {
        setOutcome({ status: 'unplayed' })
      }
      setStreak(dailyStreaks(rounds, Date.now()))
    } catch (error) {
      console.warn('[soup-quiz] failed to load the daily', error)
    }
  }, [daily.daySeed])

  useFocusEffect(useCallback(() => void refresh(), [refresh]))

  const commitGuess = (code: string) => {
    if (outcome.status !== 'unplayed') return
    const correct = isCorrect(daily.item, 'countries', code)
    guesses.current.push({
      itemId: daily.item.id,
      correct,
      answeredAt: Date.now(),
    })
    if (correct) {
      finish(tier)
      return
    }
    const nearest = Math.min(
      ...daily.item.countries.map(
        (country) => distanceKm(code, country) ?? Number.POSITIVE_INFINITY,
      ),
    )
    const band = heatBand(nearest)
    setHeat(`${band.icon} ${countryName(code)} — ${band.label}`)
    if (tier >= DAILY_TIER_COUNT) {
      finish(0)
    } else {
      setTier(tier + 1)
    }
  }

  const finish = (solvingTier: number) => {
    setOutcome(solvingTier > 0 ? { status: 'solved', tier: solvingTier } : { status: 'failed' })
    recordRound({
      kind: 'daily',
      modeId: DAILY_MODE_ID,
      seed: daily.daySeed,
      length: DAILY_TIER_COUNT,
      correct: solvingTier,
      finishedAt: Date.now(),
      answers: guesses.current,
    })
      .then(refresh)
      .catch((error) => console.warn('[soup-quiz] failed to record the daily', error))
  }

  const share = () => {
    const streakLine = streak.current > 0 ? ` · 🔥 ${streak.current}-day streak` : ''
    const score =
      outcome.status === 'solved' ? `clue ${outcome.tier}/${DAILY_TIER_COUNT}` : 'the soup escaped'
    void Share.share({
      message: `🥣 Soup Quiz #${dayNumber} — ${score}${streakLine}`,
    })
  }

  const played = outcome.status !== 'unplayed'
  const msToRollover = (dayIndex + 1) * 86_400_000 - now
  const hours = Math.floor(msToRollover / 3_600_000)
  const minutes = Math.floor((msToRollover % 3_600_000) / 60_000)

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Text style={styles.title}>Today&apos;s soup</Text>
          <Text style={styles.countdown}>
            #{dayNumber} · new soup in {hours}h {minutes}m
          </Text>
        </View>

        <View style={styles.clueCard}>
          <Image style={styles.photo} source={soupImages[daily.item.id]} contentFit="cover" />
          {tier >= 2 && <Chips ingredients={daily.halves[0]} />}
          {tier >= 3 && <Chips ingredients={daily.halves[1]} />}
          {tier >= 4 && <Text style={styles.nameClue}>{daily.item.name}</Text>}
        </View>

        {outcome.status === 'unplayed' ? (
          <View style={styles.guessBlock}>
            <SearchSelect onCommit={commitGuess} />
            {heat !== undefined && <Text style={styles.heat}>{heat}</Text>}
            <Text style={styles.tierHint}>
              Clue {tier} of {DAILY_TIER_COUNT} · a wrong guess opens the next clue
            </Text>
          </View>
        ) : (
          <View style={styles.finishedBlock}>
            <Text style={styles.outcome}>
              {outcome.status === 'solved'
                ? `Solved on clue ${outcome.tier} of ${DAILY_TIER_COUNT}`
                : 'The soup escaped — see it below'}
            </Text>
            <Text style={styles.streakLine}>
              🔥 {streak.current}-day streak (best {streak.best})
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={share}
              style={({ pressed }) => [styles.shareButton, pressed && styles.sharePressed]}
            >
              <Text style={styles.shareText}>Share result</Text>
            </Pressable>
          </View>
        )}

        {played && <RevealCard item={daily.item} />}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backLink, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.backText}>Back to the menu</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Chips({ ingredients }: { ingredients: { id: string; display: string }[] }) {
  return (
    <View style={styles.chips}>
      {ingredients.map((ingredient) => (
        <View key={ingredient.id} style={styles.chip}>
          <Text style={styles.chipText}>{ingredient.display}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...type.title,
  },
  countdown: {
    ...type.caption,
  },
  clueCard: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  photo: {
    aspectRatio: 4 / 3,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    width: '100%',
  },
  nameClue: {
    ...type.menuTitle,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipText: {
    ...type.body,
  },
  guessBlock: {
    gap: spacing.sm,
  },
  heat: {
    ...type.body,
    color: colors.tomato,
    fontWeight: '600',
  },
  tierHint: {
    ...type.caption,
  },
  finishedBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  outcome: {
    ...type.title,
  },
  streakLine: {
    ...type.bodySoft,
  },
  shareButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tomato,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  sharePressed: {
    backgroundColor: colors.tomatoDeep,
  },
  shareText: {
    ...type.body,
    color: colors.onTomato,
    fontWeight: '700',
  },
  backLink: {
    paddingVertical: spacing.sm,
  },
  backText: {
    ...type.body,
    color: colors.inkSoft,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
