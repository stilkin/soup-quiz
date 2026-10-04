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

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/daily')}
          style={({ pressed }) => [styles.dailyCard, pressed && { opacity: 0.85 }]}
        >
          <View>
            <Text style={styles.dailyTitle}>Today&apos;s soup</Text>
            <Text style={styles.dailyHint}>
              {dailyState.played
                ? dailyState.solved
                  ? `Solved on clue ${dailyState.tier} of ${DAILY_TIER_COUNT}`
                  : 'It escaped today — come back tomorrow'
                : 'One bowl a day. Photo first, name last.'}
            </Text>
          </View>
          <Text style={styles.dailyAction}>{dailyState.played ? 'View' : 'Play'}</Text>
        </Pressable>

        <View style={styles.modeBlock}>
          <Text style={styles.modeTitle}>{ingredientsToCountry.title}</Text>
          <Text style={styles.modeHint}>
            Read the ingredients, name the country. Eight bowls a round.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/play')}
            style={({ pressed }) => [styles.play, pressed && styles.playPressed]}
          >
            <Text style={styles.playText}>Play</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/stats')}
            style={({ pressed }) => [styles.statsLink, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.statsLinkText}>Your stats</Text>
          </Pressable>
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
    gap: spacing.xxl,
    justifyContent: 'space-between',
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
  dailyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  dailyTitle: {
    ...type.title,
    fontSize: 18,
    lineHeight: 24,
  },
  dailyHint: {
    ...type.bodySoft,
    fontSize: 14,
    lineHeight: 19,
  },
  dailyAction: {
    ...type.body,
    color: colors.tomato,
    fontWeight: '700',
  },
  modeBlock: {
    gap: spacing.sm,
  },
  modeTitle: {
    ...type.title,
  },
  modeHint: {
    ...type.bodySoft,
    marginBottom: spacing.md,
  },
  play: {
    backgroundColor: colors.tomato,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.huge,
    paddingVertical: spacing.lg,
    alignSelf: 'flex-start',
  },
  playPressed: {
    backgroundColor: colors.tomatoDeep,
  },
  playText: {
    ...type.body,
    color: colors.onTomato,
    fontSize: 18,
    fontWeight: '700',
  },
  statsLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  statsLinkText: {
    ...type.body,
    color: colors.inkSoft,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    ...type.caption,
  },
})
