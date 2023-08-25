export type RemindersOptionsValues = { [key: string]: string }

export type RemindersOptions = {
  [key: string]: {
    name: string
    description: string
  }
}

export type RemindersCommand = {
  name: string
  description: string
}

export const RemindersOptions: RemindersOptions = {
  When: {
    name: 'when',
    description:
      'When to be sent your reminder, if `recurring` is true, this is treated as an interval.',
  },
}

export const RemindersOptionsDescriptions: { [key: string]: string } = {
  When: 'When to be sent your reminder, if `recurring` is true, this is treated as an interval.',
}
