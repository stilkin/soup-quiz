import type { StatsSummary } from '@soup-quiz/stats'
import { StyleSheet, Text, View } from 'react-native'
import { colors, font, radius, spacing, type } from '../theme'

/** Summary card: the headline numbers in the display face, menu-price style. */
export function StatSummary({
  summary,
  countries,
}: {
  summary: StatsSummary
  countries: { discovered: number; total: number }
}) {
  return (
    <View style={styles.card}>
      <View style={styles.grid}>
        <StatNumber label="rounds" value={String(summary.rounds)} />
        <StatNumber label="accuracy" value={percent(summary.accuracy)} />
        <StatNumber
          label="countries discovered"
          value={`${countries.discovered}/${countries.total}`}
        />
        <StatNumber label="day streak" value={String(summary.currentStreak)} />
      </View>
      <Text style={styles.best}>Best streak {summary.bestStreak} days</Text>
    </View>
  )
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function StatNumber({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    gap: 2,
    paddingBottom: spacing.md,
    width: '50%',
  },
  value: {
    ...type.menuTitle,
    fontFamily: font.display,
    fontSize: 34,
    lineHeight: 38,
  },
  label: {
    ...type.caption,
  },
  best: {
    ...type.caption,
  },
})
