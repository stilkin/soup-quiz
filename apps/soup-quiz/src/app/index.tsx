import { soupsV1 } from '@soup-quiz/data'
import {
  DAILY_TIER_COUNT,
  dailyForDay,
  dayIndexFrom,
  ingredientsToCountry,
} from '@soup-quiz/engine'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fetchDailyRound } from '../storage/repo'
import { colors, radius, spacing, type } from '../theme'

// Task 5.2 gate: proves the monorepo packages resolve through Metro.
console.log(`[soup-quiz] dataset loaded via workspace packages: ${soupsV1.length} items`)

/** Unplayed / solved-on-tier / failed — undefined until the storage answers. */
type DailyState = { played: false } | { played: true; solved: boolean; tier: number }

/** One of the three equal menu destinations: whole card taps, pill marks the action. */
function MenuTile({
  title,
  hint,
  action,
  onPress,
}: {
  title: string
  hint: string
  action: string
  onPress: () => void
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
    >
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileHint}>{hint}</Text>
      <View style={styles.tilePill}>
        <Text style={styles.tilePillText}>{action}</Text>
      </View>
    </Pressable>
  )
}

export default function StartScreen() {
  const [dailyState, setDailyState] = useState<DailyState>({ played: false })

  useFocusEffect(
    useCallback(() => {
      const today = dailyForDay(soupsV1, dayIndexFrom(Date.now()))
      fetchDailyRound(today.daySeed)
        .then((row) =>
          setDailyState(
            row ? { played: true, solved: row.correct > 0, tier: row.correct } : { played: false },
          ),
        )
        .catch((error) => console.warn('[soup-quiz] failed to load the daily state', error))
    }, []),
  )

  useEffect(() => {
    // keep the log per-mount too, so Expo Go reloads surface it
    console.log(`[soup-quiz] ready to play: ${ingredientsToCountry.title}`)
  }, [])

  const dailyHint = !dailyState.played
    ? 'One bowl a day. Photo first, name last.'
    : dailyState.solved
      ? `Solved on clue ${dailyState.tier} of ${DAILY_TIER_COUNT}`
      : 'It escaped today — come back tomorrow'

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <View>
          <Text style={styles.title}>Soup Quiz</Text>
          <DoubleRule />
          <Text style={styles.menuLine}>
            {soupsV1.length} soups on the menu, from {distinctCountryCount()} kitchens
          </Text>
        </View>

        <View style={styles.menu}>
          <MenuTile
            title="Today&apos;s soup"
            hint={dailyHint}
            action={dailyState.played ? 'View' : 'Play'}
            onPress={() => router.push('/daily')}
          />
          <MenuTile
            title={ingredientsToCountry.title}
            hint="Read the ingredients, name the country. Five bowls a round."
            action="Play"
            onPress={() => router.push('/play')}
          />
          <MenuTile
            title="Your stats"
            hint="Accuracy, streaks, and which soups need practice."
            action="Open"
            onPress={() => router.push('/stats')}
          />
        </View>

        <Text style={styles.footer}>Data from Wikipedia, credited per soup</Text>
      </View>
    </SafeAreaView>
  )
}

function distinctCountryCount(): number {
  return new Set(soupsV1.flatMap((item) => item.countries)).size
}

/** Menu-style double rule under the title. */
function DoubleRule() {
  return (
    <View style={styles.ruleWrap}>
      <View style={styles.rule} />
      <View style={styles.rule} />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  wrap: {
    flex: 1,
    gap: spacing.xl,
    padding: spacing.xxl,
    paddingTop: spacing.huge,
  },
  title: {
    ...type.display,
  },
  ruleWrap: {
    gap: 3,
    marginVertical: spacing.lg,
  },
  rule: {
    borderBottomWidth: 1,
    borderColor: colors.ink,
  },
  menuLine: {
    ...type.bodySoft,
  },
  menu: {
    flex: 1,
    gap: spacing.md,
  },
  tile: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  tilePressed: {
    opacity: 0.85,
  },
  tileTitle: {
    ...type.menuTitle,
  },
  tileHint: {
    ...type.bodySoft,
  },
  tilePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tomato,
    borderRadius: radius.pill,
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  tilePillText: {
    ...type.body,
    color: colors.onTomato,
    fontWeight: '700',
  },
  footer: {
    ...type.caption,
  },
})
