import type { SoupItem } from '@soup-quiz/schema'
import { countryName, flagEmoji } from '@soup-quiz/schema'
import type { SoupProgress } from '@soup-quiz/stats'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, type } from '../theme'

/** One soup in the weakest-first list: provenance, accuracy bar, mastery chip. */
export function SoupMasteryRow({ item, progress }: { item: SoupItem; progress: SoupProgress }) {
  const accuracy = Math.round(progress.accuracy * 100)
  return (
    <View style={styles.row}>
      <View style={styles.headline}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.origin} numberOfLines={1}>
          {item.countries.map((code) => `${flagEmoji(code)} ${countryName(code)}`).join(', ')}
        </Text>
      </View>
      {progress.mastered ? (
        <View style={styles.chip}>
          <Text style={styles.chipText}>Mastered</Text>
        </View>
      ) : (
        <Text style={styles.score}>{accuracy}%</Text>
      )}
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${accuracy}%` }, progress.mastered && styles.fillMastered]}
        />
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
  origin: {
    ...type.caption,
  },
  score: {
    ...type.bodySoft,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  chip: {
    backgroundColor: colors.basil,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  chipText: {
    ...type.caption,
    color: colors.onBasil,
    fontWeight: '700',
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
  fillMastered: {
    backgroundColor: colors.basil,
  },
})
