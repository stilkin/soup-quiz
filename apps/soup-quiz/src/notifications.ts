import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * The daily nudge: one local notification a day at the player's chosen hour.
 * Every export resolves — nothing here throws; failures log and degrade to "no
 * reminder", so call sites can fire and forget. Expo Go on Android ships no
 * expo-notifications native module at all (removed in SDK 53), so it is gated
 * before the first import — iOS Expo Go still schedules locally. Web has no
 * scheduler either.
 */

type NotificationsModule = typeof import('expo-notifications')
type NotificationTrigger = import('expo-notifications').NotificationTrigger

export const DEFAULT_REMINDER_HOUR = 9

const DAILY_REMINDER_ID = 'daily-soup-reminder'

let modulePromise: Promise<NotificationsModule | undefined> | undefined

function notificationsModule(): Promise<NotificationsModule | undefined> {
  if (Platform.OS === 'android' && Constants.executionEnvironment === 'storeClient') {
    return Promise.resolve(undefined) // Android Expo Go: module absent — never import
  }
  if (Platform.OS === 'web') return Promise.resolve(undefined)
  modulePromise ??= import('expo-notifications').catch((error) => {
    console.warn('[soup-quiz] notifications unavailable', error)
    return undefined
  })
  return modulePromise
}

export async function notificationsAvailable(): Promise<boolean> {
  return (await notificationsModule()) !== undefined
}

/** The reminder as the OS sees it — hour included, so the UI never guesses. */
export async function reminderState(): Promise<{ on: boolean; hour: number }> {
  const notifications = await notificationsModule()
  if (notifications === undefined) return { on: false, hour: DEFAULT_REMINDER_HOUR }
  try {
    if (!(await notifications.getPermissionsAsync()).granted) {
      return { on: false, hour: DEFAULT_REMINDER_HOUR }
    }
    const scheduled = await notifications.getAllScheduledNotificationsAsync()
    const reminder = scheduled.find((notification) => notification.identifier === DAILY_REMINDER_ID)
    if (reminder === undefined) return { on: false, hour: DEFAULT_REMINDER_HOUR }
    return { on: true, hour: scheduledHour(reminder.trigger) ?? DEFAULT_REMINDER_HOUR }
  } catch (error) {
    console.warn('[soup-quiz] failed to read the reminder state', error)
    return { on: false, hour: DEFAULT_REMINDER_HOUR }
  }
}

/** Android hands back a daily trigger; iOS reconstructs a calendar one (hour nested). */
function scheduledHour(trigger: NotificationTrigger): number | undefined {
  if (trigger !== null && 'type' in trigger) {
    if (trigger.type === 'daily') return trigger.hour
    if (trigger.type === 'calendar') {
      const calendar = trigger as { hour?: number; dateComponents?: { hour?: number } }
      return calendar.dateComponents?.hour ?? calendar.hour
    }
  }
  return undefined
}

async function requestPermission(notifications: NotificationsModule): Promise<boolean> {
  try {
    const current = await notifications.getPermissionsAsync()
    if (current.granted) return true
    return (await notifications.requestPermissionsAsync()).granted
  } catch (error) {
    console.warn('[soup-quiz] notification permission failed', error)
    return false
  }
}

/** Schedules (or reschedules) the daily reminder; returns whether it is active. */
export async function enableReminder(hour: number): Promise<boolean> {
  const notifications = await notificationsModule()
  if (notifications === undefined) return false
  try {
    if (!(await requestPermission(notifications))) return false
    await notifications.cancelAllScheduledNotificationsAsync()
    await notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: "Today's soup is ready 🥣",
        body: 'One bowl, four clues. How few do you need?',
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    })
    return true
  } catch (error) {
    console.warn('[soup-quiz] failed to schedule the reminder', error)
    return false
  }
}

export async function disableReminder(): Promise<void> {
  const notifications = await notificationsModule()
  if (notifications === undefined) return
  try {
    await notifications.cancelAllScheduledNotificationsAsync()
  } catch (error) {
    console.warn('[soup-quiz] failed to cancel the reminder', error)
  }
}
