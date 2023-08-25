import humanInterval from 'human-interval'

const inputs = [
  '1 seconds',
  '1 second',
  '1 secs',
  '1 sec',
  '1 s',

  '1 mins',
  '1 min',
  '1 m',

  '1 hours',
  '1 hour',
  '1 hrs',
  '1 hr',
  '1 h',

  '1 days',
  '1 day',
  '1 d',

  '1 weeks',
  '1 week',
  '1 wk',
  '1 w',

  '1 months',
  '1 month',
  '1 mon',
  '1 mo',
  '1 M',

  '1 years',
  '1 year',
  '1 yrs',
  '1 yr',
  '1 y',

  '1 hr and 1 min 2 s',
]

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
