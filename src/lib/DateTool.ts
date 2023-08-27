import humanInterval from 'human-interval'

enum Unit {
  Seconds = 'seconds',
  Minutes = 'minutes',
  Hours = 'hours',
  Days = 'days',
  Weeks = 'weeks',
  Months = 'months',
  Years = 'years',
}

const UnitConversion: { [key: string]: Unit } = {
  secs: Unit.Seconds,
  sec: Unit.Seconds,
  s: Unit.Seconds,
  mins: Unit.Minutes,
  min: Unit.Minutes,
  m: Unit.Minutes,
  hrs: Unit.Hours,
  hr: Unit.Hours,
  h: Unit.Hours,
  d: Unit.Days,
  wk: Unit.Weeks,
  w: Unit.Weeks,
  mon: Unit.Months,
  mo: Unit.Months,
  M: Unit.Months,
  yrs: Unit.Years,
  yr: Unit.Years,
  y: Unit.Years,
}

export class DateTool {
  /**
   * Converts the given user input to a string that can be used by the human-interval package.
   *
   * @param input The user input to convert to a human interval string.
   *
   * @returns The human interval string.
   */
  public static convertToHumanInterval(input: string) {
    const res: string[] = []

    for (const key of input.split(' ')) {
      let added = false
      for (const unitKey of Object.keys(UnitConversion)) {
        if (key === unitKey && UnitConversion[unitKey]) {
          res.push(UnitConversion[unitKey])

          added = true
        }
      }

      // If the value wasn't converted and added already, add it as is.
      if (!added) res.push(key)
    }

    return res.join(' ')
  }
}
