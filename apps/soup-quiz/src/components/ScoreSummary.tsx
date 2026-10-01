import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, type } from '../theme'

/** The round's score, set like a menu price: big fraction, quiet verdict. */
export function ScoreSummary({ correct, total }: { correct: number; total: number }) {
  const verdict =
    correct === total
      ? 'A perfect pot.'
      : correct === 0
        ? 'The broth escaped you.'
        : 'Tasted and learned.'

  return (
    <View style={styles.wrap}>
      <Text style={styles.score}>
        {correct}
        <Text style={styles.total}> / {total}</Text>
      </Text>
      <Text style={styles.verdict}>{verdict}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.huge,
  },
  score: {
    ...type.display,
    fontSize: 72,
    lineHeight: 80,
  },
  total: {
    ...type.display,
    color: colors.inkSoft,
    fontSize: 40,
    lineHeight: 80,
  },
  verdict: {
    ...type.bodySoft,
  },
})
