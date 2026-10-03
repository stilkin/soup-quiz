import { countryName, flagEmoji } from '@soup-quiz/schema'
import { StyleSheet, Text, View } from 'react-native'
import { colors, radius, spacing, type } from '../theme'
import type { OptionState } from './OptionButton'

const RING: Record<OptionState, string> = {
  correct: colors.basil,
  wrong: colors.chili,
  dimmed: colors.line,
  idle: colors.line,
}

const STATE_LABEL: Record<OptionState, string> = {
  correct: 'correct',
  wrong: 'wrong pick',
  dimmed: 'not chosen',
  idle: 'not chosen',
}

interface OptionStripProps {
  options: string[]
  stateOf: (code: string) => OptionState
}

/**
 * The options after the answer: feedback, not input. Five flags fold into
 * one row — the answer wears basil and a check, a wrong pick wears chili.
 */
export function OptionStrip({ options, stateOf }: OptionStripProps) {
  return (
    <View style={styles.row}>
      {options.map((code) => {
        const state = stateOf(code)
        return (
          <View
            key={code}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${countryName(code)}, ${STATE_LABEL[state]}`}
            style={[styles.tile, { borderColor: RING[state] }, state === 'dimmed' && styles.dimmed]}
          >
            <Text style={styles.flag}>{flagEmoji(code)}</Text>
            {state === 'correct' && (
              <View style={styles.badge}>
                <Text style={styles.badgeCheck}>✓</Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  tile: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    maxWidth: 48,
  },
  dimmed: {
    opacity: 0.45,
  },
  flag: {
    ...type.body,
    fontSize: 24,
    lineHeight: 30,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.basil,
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 3,
    top: 3,
    width: 18,
  },
  badgeCheck: {
    color: colors.onBasil,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
})
