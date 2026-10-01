import { Fraunces_600SemiBold, Fraunces_900Black, useFonts } from '@expo-google-fonts/fraunces'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { colors, font } from '../theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    [font.display]: Fraunces_900Black,
    [font.displaySoft]: Fraunces_600SemiBold,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: colors.bg },
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  )
}
