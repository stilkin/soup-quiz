import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

/**
 * The daily nudge: one local notification a day at the player's chosen hour.
 * Local-only (works in Expo Go), generic content (never names the soup), and
 * entirely optional — declining permission or an unsupported device changes
 * nothing else about the app.
 */

const DAILY_REMINDER_ID = 'daily-soup-reminder'

export async function reminderEnabled(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync()
  return settings.granted && (await hasScheduledReminder())
}

async function hasScheduledReminder(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  return scheduled.some((notification) => notification.identifier === DAILY_REMINDER_ID)
}

/** Asks permission; returns true only when granted. Never throws to the caller. */
async function requestPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync()
    if (current.granted) return true
    return (await Notifications.requestPermissionsAsync()).granted
  } catch (error) {
    console.warn('[soup-quiz] notification permission failed', error)
    return false
  }
}

/** Schedules (or reschedules) the daily reminder; returns whether it is active. */
export async function enableReminder(hour: number): Promise<boolean> {
  if (!(await requestPermission())) return false
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Today's soup is ready 🥣",
      body: 'One bowl, four clues. How few do you need?',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
    },
  })
  return true
}

export async function disableReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/** Expo Go and emulators without notification support report it here. */
export function notificationsSupported(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios'
}
