/** The possible formats for a Discord Timestamp. */
export enum TimestampFormat {
  /* 0 seconds ago */
  RelativeTime = 'R',

  /* March 5, 2020 */
  LongDate = 'D',

  /** 05/03/2020 */
  ShortDate = 'd',

  /** 11:28:27 AM */
  LongTime = 'T',

  /** 11:28 AM */
  ShortTime = 't',

  /** Thursday, March 5, 2020 11:28:27 AM */
  LongDateTime = 'F',

  /** 5 March 2020 11:28 */
  ShortDateTime = 'f',
}

/** This is a utility class for creating/managing Discord Timestamps. */
export class DiscordTimestamps {
  public static getTimestamp(
    date?: string | Date | null,
    format: TimestampFormat = TimestampFormat.RelativeTime
  ) {
    if (date) {
      if (typeof date === 'string') date = new Date(date)

      return `<t:${Math.floor(date.getTime() / 1000)}:${format}>`
    } else return null
  }
}
