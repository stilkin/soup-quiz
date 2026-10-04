import type { SoupItem } from '@soup-quiz/schema'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, type } from '../theme'

/**
 * The question: a soup's ingredients, set like a line on a menu. After the
 * answer the line closes to one row with a chevron — the list is reference
 * now, and reopens on demand.
 */
export function QuestionCard({ item, answered }: { item: SoupItem; answered: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const header = (
    <View style={styles.promptRow}>
      <Text style={styles.prompt}>What&apos;s in the bowl?</Text>
      {answered && <Text style={[styles.chevron, expanded && styles.chevronOpen]}>▾</Text>}
    </View>
  )

  return (
    <View style={styles.card}>
      {answered ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Hide ingredients' : 'Show ingredients'}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
        >
          {header}
        </Pressable>
      ) : (
        header
      )}
      {(!answered || expanded) && (
        <View style={styles.chips}>
          {item.ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.chip}>
              <Text style={styles.chipText}>{ingredient.display}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
  },
  toggle: {
    marginHorizontal: -spacing.xs,
  },
  togglePressed: {
    opacity: 0.7,
  },
  promptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  prompt: {
    ...type.title,
    flex: 1,
  },
  chevron: {
    ...type.title,
    color: colors.inkSoft,
    fontSize: 18,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
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
