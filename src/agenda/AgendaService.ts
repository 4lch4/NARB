import { Agenda, IJobParameters, Job } from '@hokify/agenda'
import { ReminderInput, ReminderJobData } from '@interfaces/index.js'
import {
  Config,
  getAllActiveRemindersQuery,
  getUserActiveRemindersQuery,
  logger,
} from '@lib/index.js'
import { CommandInteraction } from 'discord.js'
import { Client } from 'discordx'
import { Filter } from 'mongodb'

export class AgendaService {
  public client = new Agenda(Config.getAgendaConfig())

  /** Starts the {@link Agenda} job processor(s). */
  public start(): Promise<void> {
    return this.client.start()
  }

  /**
   * Reloads the previously saved {@link Agenda} jobs. Useful for when the bot is restarted and we
   * need to reload the jobs from the database.
   */
  public async reloadReminders(bot: Client) {
    const activeRemindersQuery = getAllActiveRemindersQuery()

    logger.debug(
      `[AgendaService#reloadReminders]: ${JSON.stringify(activeRemindersQuery, null, 2)}`
    )

    const reminders = await this.client.jobs(getAllActiveRemindersQuery())

    for (const reminder of reminders) {
      this.client.define(reminder.attrs.name, async job => {
        let { channelId, message, userId, mention } = job.attrs.data

        const channel = await bot.channels.fetch(channelId)

        if (channel?.isTextBased()) {
          if (mention) message = `<@${userId}> ${message}`

          return channel.send(message)
        }
      })
    }
  }

  public defineReminder(name: string, interaction: CommandInteraction): void {
    return this.client.define(name, async (job: Job<ReminderJobData>) => {
      let { channelId, message, userId, mention } = job.attrs.data

      const channel = await interaction.client.channels.fetch(channelId)

      if (channel?.isTextBased()) {
        if (mention) message = `<@${userId}> ${message}`

        return channel.send(message)
      }
    })
  }

  public scheduleReminder(
    name: string,
    { channelId, message, userId, when, mention, recurring, timezone }: ReminderInput
  ): Promise<Job<ReminderJobData>> {
    const JobData: ReminderJobData = {
      when,
      userId,
      message,
      channelId,

      recurring: recurring || false,
      mention: mention || false,
      timezone: timezone || 'America/Chicago',
    }

    if (JobData.recurring) return this.client.every(when, name, JobData, { skipImmediate: true })
    else return this.client.schedule(when, name, JobData)
  }

  public async cancel(input: Filter<IJobParameters<unknown>>) {
    return this.client.cancel(input)
  }

  /**
   * Queries the database for reminders using the provided `query`, `sort`, and `limit` parameters.
   *
   * @param query A MongoDB query.
   * @param sort A MongoDB sort.
   * @param limit A MongoDB limit.
   *
   * @returns An array of reminders.
   */
  public async getReminders(
    query: any,
    sort?: any,
    limit?: number
  ): Promise<Job<ReminderJobData>[]> {
    const remindersData = await this.client.jobs(query, sort, limit)

    return remindersData as Job<ReminderJobData>[]
  }

  /**
   * Queries the database for a reminder using the provided `query` and `sort` parameters and
   * returns the first result.
   *
   * @param query A MongoDB query.
   * @param sort A MongoDB sort.
   *
   * @returns A reminder.
   */
  public async getReminder(query: any, sort?: any): Promise<Job<ReminderJobData>> {
    const reminderData = await this.client.jobs(query, sort, 1)

    return reminderData[0] as Job<ReminderJobData>
  }

  /**
   * Queries the database for any reminders for the user with the provided `userId`.
   *
   * @param userId The Discord user ID.
   *
   * @returns An array of reminders.
   */
  public async getUserReminders(userId: string): Promise<Job<ReminderJobData>[]> {
    const remindersData = await this.client.jobs({ 'data.userId': userId })

    return remindersData as Job<ReminderJobData>[]
  }

  public initCleanupJob() {
    this.client.define('stale-reminder-cleanup', async () => {
      // return this.client.cancel({ type: 'normal', lastRunAt: { $exists: true } })
      const jobs = await this.client.jobs({ type: 'normal', lastRunAt: { $exists: true } })

      for (const job of jobs) {
        await job.remove()
      }
    })

    return this.client.every('1 hour', 'stale-reminder-cleanup')
  }

  public async getUserActiveReminders(userId: string): Promise<Job<ReminderJobData>[]> {
    const reminders = await this.client.jobs(getUserActiveRemindersQuery(userId))

    return reminders as Job<ReminderJobData>[]
  }
}
