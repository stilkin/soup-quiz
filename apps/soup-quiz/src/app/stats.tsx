import { soupsV0 } from '@soup-quiz/data'
import { aggregateStats, type StatsView } from '@soup-quiz/stats'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SoupMasteryRow } from '../components/SoupMasteryRow'
import { StatSummary } from '../components/StatSummary'
import { clearAllStats, fetchAnswers, fetchRounds } from '../storage/repo'
import { colors, spacing, type } from '../theme'

const byId = new Map(soupsV0.map((soup) => [soup.id, soup]))

export default function StatsScreen() {
  const [view, setView] = useState<StatsView | undefined>()

  const load = useCallback(async () => {
    try {
      const [rounds, answers] = await Promise.all([fetchRounds(), fetchAnswers()])
      setView(aggregateStats(rounds, answers, soupsV0.length))
    } catch (error) {
      console.warn('[soup-quiz] failed to load stats', error)
      setView(aggregateStats([], [], soupsV0.length))
    }
  }, [])

  // refresh whenever the screen gains focus (e.g. returning from a round)
  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const confirmClear = () => {
    Alert.alert('Clear stats?', 'Every recorded round will be deleted.', [
      { style: 'cancel', text: 'Keep them' },
      {
        style: 'destructive',
        text: 'Clear everything',
        onPress: () => {
          clearAllStats()
            .then(load)
            .catch((error) => console.warn('[soup-quiz] failed to clear stats', error))
        },
      },
    ])
  }

  const empty = view !== undefined && view.summary.rounds === 0

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your stats</Text>

        {view === undefined && <Text style={styles.hint}>Setting the table…</Text>}

        {empty && (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>No bowls tasted yet.</Text>
            <Text style={styles.emptyHint}>
              Play a round and your progress will be served here — accuracy, streaks, and which
              soups still need practice.
            </Text>
            <Pressable
              onPress={() => router.push('/play')}
              style={({ pressed }) => [styles.play, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.playText}>Play a round</Text>
            </Pressable>
          </View>
        )}

        {view !== undefined && !empty && (
          <>
            <StatSummary summary={view.summary} />
            <Text style={styles.section}>Weakest first</Text>
            {view.soups.map((progress) => {
              const item = byId.get(progress.itemId)
              if (item === undefined) return null
              return <SoupMasteryRow key={progress.itemId} item={item} progress={progress} />
            })}
            <Pressable
              onPress={confirmClear}
              style={({ pressed }) => [styles.clear, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.clearText}>Clear stats</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  heading: {
    ...type.title,
  },
  hint: {
    ...type.bodySoft,
  },
  emptyBlock: {
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  emptyTitle: {
    ...type.menuTitle,
  },
  emptyHint: {
    ...type.bodySoft,
  },
  play: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tomato,
    borderRadius: 999,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  playText: {
    ...type.body,
    color: colors.onTomato,
    fontWeight: '700',
  },
  section: {
    ...type.title,
    fontSize: 18,
    marginTop: spacing.sm,
  },
  clear: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  clearText: {
    ...type.body,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
})
