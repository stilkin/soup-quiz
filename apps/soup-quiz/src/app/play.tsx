import { soupsV0 } from '@soup-quiz/data'
import { generateRound, ingredientsToCountry, scoreRound } from '@soup-quiz/engine'
import { router } from 'expo-router'
import React, { useMemo, useReducer } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { OptionButton, type OptionState } from '../components/OptionButton'
import { QuestionCard } from '../components/QuestionCard'
import { RevealCard } from '../components/RevealCard'
import { colors, radius, spacing, type } from '../theme'

const ROUND_LENGTH = Math.min(8, soupsV0.length)

interface PlayState {
  index: number
  /** One answer per question slot — the array shape is the one-answer rule. */
  answers: (string | undefined)[]
}

type PlayAction = { type: 'answer'; value: string } | { type: 'next' }

function reducer(state: PlayState, action: PlayAction): PlayState {
  switch (action.type) {
    case 'answer': {
      if (state.answers[state.index] !== undefined) return state
      const answers = [...state.answers]
      answers[state.index] = action.value
      return { ...state, answers }
    }
    case 'next':
      return { ...state, index: state.index + 1 }
  }
}

export default function PlayScreen() {
  // New seed per mount: replaying from the result screen remounts with a fresh round.
  const seed = useMemo(() => Math.floor(Math.random() * 2 ** 31), [])
  const round = useMemo(
    () => generateRound(soupsV0, ingredientsToCountry, { seed, length: ROUND_LENGTH }),
    [seed],
  )
  const [state, dispatch] = useReducer(reducer, { index: 0, answers: [] })

  const question = round.questions[state.index]
  const isLast = state.index === round.questions.length - 1

  if (question === undefined) {
    // All questions answered — hand the score to the result screen.
    const { correct, total } = scoreRound(round, state.answers)
    // schedule navigation outside of render
    return <Finished correct={correct} total={total} />
  }

  const selected = state.answers[state.index]
  const answered = selected !== undefined

  const optionState = (code: string): OptionState => {
    if (!answered) return 'idle'
    if (code === question.answer) return 'correct'
    if (code === selected) return 'wrong'
    return 'dimmed'
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.mode}>{round.mode.title}</Text>
          <ProgressDots current={state.index} total={round.questions.length} answered={answered} />
        </View>

        <QuestionCard item={question.item} />

        <View style={styles.options}>
          {question.options.map((code) => (
            <OptionButton
              key={code}
              code={code}
              state={optionState(code)}
              disabled={answered}
              onPress={() => dispatch({ type: 'answer', value: code })}
            />
          ))}
        </View>

        {answered && (
          <View style={styles.revealBlock}>
            <RevealCard item={question.item} />
            <Pressable
              accessibilityRole="button"
              onPress={() => dispatch({ type: 'next' })}
              style={({ pressed }) => [styles.next, pressed && styles.nextPressed]}
            >
              <Text style={styles.nextText}>{isLast ? 'See the score' : 'Next soup'}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/** Shown for one frame when the round ends; redirects to the result screen. */
function Finished({ correct, total }: { correct: number; total: number }) {
  React.useEffect(() => {
    router.replace({
      pathname: '/result',
      params: { correct: String(correct), total: String(total) },
    })
  }, [correct, total])
  return <SafeAreaView style={styles.safe} />
}

function ProgressDots({
  current,
  total,
  answered,
}: {
  current: number
  total: number
  answered: boolean
}) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View
          // biome-ignore lint/suspicious/noArrayIndexKey: dots are fixed-position markers; the index is their identity
          key={i}
          style={[
            styles.dot,
            i < current && styles.dotDone,
            i === current && (answered ? styles.dotDone : styles.dotCurrent),
          ]}
        />
      ))}
    </View>
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mode: {
    ...type.caption,
    fontWeight: '600',
  },
  options: {
    gap: spacing.sm,
  },
  revealBlock: {
    gap: spacing.lg,
  },
  next: {
    alignItems: 'center',
    backgroundColor: colors.tomato,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
  },
  nextPressed: {
    backgroundColor: colors.tomatoDeep,
  },
  nextText: {
    ...type.body,
    color: colors.onTomato,
    fontWeight: '700',
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    backgroundColor: colors.line,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotCurrent: {
    backgroundColor: colors.gold,
  },
  dotDone: {
    backgroundColor: colors.basil,
  },
})
