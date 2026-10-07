import { countryName, flagEmoji } from '@soup-quiz/schema'
import type { CountryProgress } from '@soup-quiz/stats'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, type } from '../theme'

/** One country in the weakest-first breakdown: flag, name, accuracy bar. */
export function CountryRow({ progress }: { progress: CountryProgress }) {
  const accuracy = Math.round(progress.accuracy * 100)
  return (
    <View style={styles.row}>
      <View style={styles.headline}>
        <Text style={styles.name} numberOfLines={1}>
          {flagEmoji(progress.code)} {countryName(progress.code)}
        </Text>
        <Text style={styles.detail}>
          {progress.correct} of {progress.asked} right
        </Text>
      </View>
      <Text style={styles.score}>{accuracy}%</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${accuracy}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  headline: {
    flexBasis: 0,
    flexGrow: 1,
    gap: 2,
  },
  name: {
    ...type.body,
    fontWeight: '600',
  },
  detail: {
    ...type.caption,
  },
  score: {
    ...type.bodySoft,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  track: {
    backgroundColor: colors.line,
    borderRadius: radius.pill,
    flexBasis: '100%',
    height: 4,
  },
  fill: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    height: 4,
  },
})
