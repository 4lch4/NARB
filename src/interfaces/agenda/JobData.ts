export type ReminderJobData = {
  /** A string indicating when a reminder should be sent. */
  when: string

  /** The message to be sent in a reminder. */
  message: string

  /** The channel ID to send a reminder to. */
  channelId: string

  /** The user ID to send a reminder to and mention. */
  userId: string
}
