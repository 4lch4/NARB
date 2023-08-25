export type ReminderInput = {
  /** A string indicating when a reminder should be sent. */
  when: string

  /** The message to be sent in a reminder. */
  message: string

  /** The channel ID to send a reminder to. */
  channelId: string

  /** The user ID to send a reminder to and mention. */
  userId: string

  /** Whether or not to mention the user in the reminder (default: `false`). */
  mention?: boolean

  /** Whether or not a reminder should be recurring (default: `false`). */
  recurring?: boolean

  /** The timezone to use when scheduling a reminder (default: `America/Chicago`). */
  timezone?: string
}

export type ReminderJobData = {
  /** A string indicating when a reminder should be sent. */
  when: string

  /** The message to be sent in a reminder. */
  message: string

  /** The channel ID to send a reminder to. */
  channelId: string

  /** The user ID to send a reminder to and mention. */
  userId: string

  /** Whether or not to mention the user in the reminder (default: `false`). */
  mention: boolean

  /** Whether or not a reminder should be recurring (default: `false`). */
  recurring: boolean

  /** The timezone to use when scheduling a reminder (default: `America/Chicago`). */
  timezone: string
}
