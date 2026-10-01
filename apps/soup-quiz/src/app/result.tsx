import { router, useLocalSearchParams } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScoreSummary } from '../components/ScoreSummary'
import { colors, radius, spacing, type } from '../theme'

export default function ResultScreen() {
  const params = useLocalSearchParams<{ correct: string; total: string }>()
  const correct = Number(params.correct ?? 0)
  const total = Number(params.total ?? 0)

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.wrap}>
        <Text style={styles.heading}>Tonight&apos;s tasting</Text>
        <ScoreSummary correct={correct} total={total} />

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/play')}
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          >
            <Text style={styles.primaryText}>Play another round</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.secondaryText}>Back to the menu</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
  },
  heading: {
    ...type.title,
  },
  actions: {
    gap: spacing.md,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.tomato,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
  },
  primaryPressed: {
    backgroundColor: colors.tomatoDeep,
  },
  primaryText: {
    ...type.body,
    color: colors.onTomato,
    fontWeight: '700',
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  secondaryText: {
    ...type.body,
    color: colors.inkSoft,
    fontWeight: '600',
  },
})
