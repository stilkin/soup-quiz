import type { SoupItem } from '@soup-quiz/schema'
import { countryName, flagEmoji } from '@soup-quiz/schema'
import { Image } from 'expo-image'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { soupImages } from '../images'
import { colors, font, radius, spacing, type } from '../theme'

/**
 * The reveal: the soup lands like tonight's menu entry — name in the display
 * face, description beneath, provenance line, read-more link, and the credited
 * image when one ships (change 2).
 */
export function RevealCard({ item }: { item: SoupItem }) {
  const image = soupImages[item.id]
  const credit = item.image?.credit

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.origin}>
          {item.countries.map((code) => `${flagEmoji(code)} ${countryName(code)}`).join(', ')}
        </Text>
      </View>
      {item.region !== undefined && <Text style={styles.region}>{item.region}</Text>}
      <Text style={styles.description}>{item.description}</Text>

      {image !== undefined && credit !== undefined && (
        <View style={styles.imageBlock}>
          <Image style={styles.image} source={image} contentFit="cover" />
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(credit.licenseUrl)}>
            <Text style={styles.credit}>
              {credit.author} · {credit.license}
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        accessibilityRole="link"
        onPress={() => Linking.openURL(item.sourceUrl)}
        style={({ pressed }) => [styles.linkWrap, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.link}>Read more on Wikipedia</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  headerRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  name: {
    ...type.menuTitle,
  },
  origin: {
    ...type.bodySoft,
  },
  region: {
    ...type.caption,
  },
  description: {
    ...type.body,
  },
  imageBlock: {
    gap: spacing.xs,
  },
  image: {
    aspectRatio: 16 / 9,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    width: '100%',
  },
  credit: {
    ...type.caption,
    fontFamily: font.body,
    textDecorationLine: 'underline',
  },
  linkWrap: {
    marginTop: spacing.xs,
  },
  link: {
    ...type.body,
    color: colors.tomato,
    fontWeight: '600',
  },
})
