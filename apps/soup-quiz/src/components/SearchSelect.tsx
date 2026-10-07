import { COUNTRIES, countryName, flagEmoji } from '@soup-quiz/schema'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native'
import { colors, radius, spacing, type } from '../theme'

const ALL_CODES = Object.keys(COUNTRIES)
const MAX_SUGGESTIONS = 6

interface SearchSelectProps {
  onCommit: (code: string) => void
  disabled?: boolean
}

/**
 * The daily's answer box: type a country, tap a suggestion. Committing happens
 * only on selection — typing and browsing never spend a guess.
 */
export function SearchSelect({ onCommit, disabled = false }: SearchSelectProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matches =
    needle.length === 0
      ? []
      : ALL_CODES.filter((code) => countryName(code).toLowerCase().includes(needle)).slice(
          0,
          MAX_SUGGESTIONS,
        )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrap}
    >
      <TextInput
        accessibilityLabel="Country guess"
        editable={!disabled}
        onChangeText={setQuery}
        placeholder="Type a country…"
        style={styles.input}
        value={query}
      />
      {matches.map((code) => (
        <Pressable
          key={code}
          accessibilityRole="button"
          accessibilityLabel={countryName(code)}
          disabled={disabled}
          onPress={() => {
            setQuery('')
            onCommit(code)
          }}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <Text style={styles.flag}>{flagEmoji(code)}</Text>
          <Text style={styles.name}>{countryName(code)}</Text>
        </Pressable>
      ))}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    ...type.body,
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  flag: {
    ...type.body,
    fontSize: 20,
    lineHeight: 26,
  },
  name: {
    ...type.body,
    flex: 1,
    fontWeight: '500',
  },
})
