import { logger } from '@4lch4/logger'
import { getActiveRemindersQuery } from '@constants/index.js'
import { Agenda, Job } from '@hokify/agenda'
import { ReminderInput, ReminderJobData } from '@interfaces/index.js'
import { Config } from '@lib/index.js'
import { CommandInteraction } from 'discord.js'

export class AgendaService {
  public client: Agenda
  private calls: Array<Promise<any>> = []

  public constructor() {
    this.client = new Agenda(Config.getAgendaConfig())
  }

  /** Starts the {@link Agenda} job processor(s). */
  public start(): Promise<void> {
    return this.client.start()
  }

  public defineReminder(name: string, interaction: CommandInteraction): void {
    return this.client.define(name, async (job: Job<ReminderJobData>) => {
      let { channelId, message, userId, when, mention } = job.attrs.data

      logger.debug(`[ReminderJob#define:run]: Within the ${job.attrs.name} job...`)
      logger.debug(`[ReminderJob#define:run]: Channel ID: ${channelId}`)
      logger.debug(`[ReminderJob#define:run]: Message: ${message}`)
      logger.debug(`[ReminderJob#define:run]: User ID: ${userId}`)
      logger.debug(`[ReminderJob#define:run]: When: ${when}`)

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

  public async getUserActiveReminders(userId: string): Promise<Job<ReminderJobData>[]> {
    const reminders = await this.client.jobs(getActiveRemindersQuery(userId))

    return reminders as Job<ReminderJobData>[]
  }
}
