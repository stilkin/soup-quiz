import Constants from 'expo-constants'

/**
 * The daily nudge: one local notification a day at the player's chosen hour.
 * expo-notifications cannot even be imported in Expo Go (the module throws there
 * since SDK 53), so it is loaded lazily and every call degrades to a no-op outside
 * a development or standalone build. Declining permission, or running somewhere
 * without notifications, changes nothing else about the app.
 */

type NotificationsModule = typeof import('expo-notifications')

const DAILY_REMINDER_ID = 'daily-soup-reminder'

let modulePromise: Promise<NotificationsModule | undefined> | undefined

function notificationsModule(): Promise<NotificationsModule | undefined> {
  if (Constants.executionEnvironment === 'storeClient') {
    return Promise.resolve(undefined) // Expo Go: unsupported — never even import
  }
  modulePromise ??= import('expo-notifications').catch((error) => {
    console.warn('[soup-quiz] notifications unavailable', error)
    return undefined
  })
  return modulePromise
}

export async function notificationsAvailable(): Promise<boolean> {
  return (await notificationsModule()) !== undefined
}

export async function reminderEnabled(): Promise<boolean> {
  const notifications = await notificationsModule()
  if (notifications === undefined) return false
  if (!(await notifications.getPermissionsAsync()).granted) return false
  const scheduled = await notifications.getAllScheduledNotificationsAsync()
  return scheduled.some((notification) => notification.identifier === DAILY_REMINDER_ID)
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
  if (notifications === undefined || !(await requestPermission(notifications))) return false
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
}

export async function disableReminder(): Promise<void> {
  const notifications = await notificationsModule()
  await notifications?.cancelAllScheduledNotificationsAsync()
}
