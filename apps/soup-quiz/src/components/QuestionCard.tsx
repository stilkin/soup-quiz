import type { SoupItem } from '@soup-quiz/schema'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, type } from '../theme'

/** The question: a soup's ingredients, set like a line on a menu. */
export function QuestionCard({ item }: { item: SoupItem }) {
  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>What&apos;s in the bowl?</Text>
      <View style={styles.chips}>
        {item.ingredients.map((ingredient) => (
          <View key={ingredient.id} style={styles.chip}>
            <Text style={styles.chipText}>{ingredient.display}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.xl,
  },
  prompt: {
    ...type.title,
    marginBottom: spacing.lg,
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
})
