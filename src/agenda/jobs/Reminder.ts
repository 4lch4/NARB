import { Agenda, Job } from '@hokify/agenda'
import { Client } from 'discordx'
import { ReminderJobData } from '@interfaces/index.js'
import { logger } from '@4lch4/logger'
import { JobNames } from '../index.js'

export class ReminderJob {
  public static async define(agenda: Agenda, bot: Client) {
    return agenda.define(JobNames.BasicReminder, async (job: Job<ReminderJobData>) => {
      const { channelId, message, userId, when } = job.attrs.data

      logger.debug(`[ReminderJob#define:run]: Within the ${JobNames.BasicReminder} job...`)
      logger.debug(`[ReminderJob#define:run]: Channel ID: ${channelId}`)
      logger.debug(`[ReminderJob#define:run]: Message: ${message}`)
      logger.debug(`[ReminderJob#define:run]: User ID: ${userId}`)
      logger.debug(`[ReminderJob#define:run]: When: ${when}`)

      const channel = await bot.channels.fetch(channelId)

      if (channel?.isTextBased()) {
        if (channel.isDMBased()) return channel.send(message)
        else return channel.send(`<@${userId}>: ${message}`)
      }
    })
  }
}
