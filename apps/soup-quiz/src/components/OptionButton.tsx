import { countryName, flagEmoji } from '@soup-quiz/schema'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { colors, radius, spacing, type } from '../theme'

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed'

interface OptionButtonProps {
  code: string
  state: OptionState
  disabled: boolean
  onPress: () => void
}

/**
 * One answer option. Press feedback is user-triggered (spring scale-in);
 * correct pulses basil, wrong shakes chili — food-true colors, one flourish each.
 */
export function OptionButton({ code, state, disabled, onPress }: OptionButtonProps) {
  const scale = useSharedValue(1)
  const shake = useSharedValue(0)

  const transform = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { stiffness: 400, damping: 20 })
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 20 })
  }
  const handlePress = () => {
    if (state === 'correct') {
      scale.value = withSequence(
        withSpring(1.04, { stiffness: 300, damping: 12 }),
        withSpring(1, { stiffness: 300, damping: 14 }),
      )
    }
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 70 }),
        withTiming(-5, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      )
    }
    onPress()
  }

  const palette =
    state === 'correct'
      ? { bg: colors.basil, border: colors.basilDeep, text: colors.onBasil }
      : state === 'wrong'
        ? { bg: colors.chili, border: colors.chili, text: colors.onChili }
        : { bg: colors.surface, border: colors.line, text: colors.ink }

  return (
    <Animated.View style={transform}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.base,
          { opacity: state === 'dimmed' ? 0.45 : pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.option, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Text style={[styles.flag, { color: palette.text }]}>{flagEmoji(code)}</Text>
          <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
            {countryName(code)}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    opacity: 1,
  },
  option: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  flag: {
    ...type.body,
    fontSize: 20,
    lineHeight: 26,
  },
  label: {
    ...type.body,
    flex: 1,
    fontWeight: '500',
  },
})
