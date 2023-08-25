import { logger } from '@4lch4/logger'
import { Agenda, Job } from '@hokify/agenda'
import { ReminderJobData } from '@interfaces/index.js'
import { Config } from '@lib/index.js'

export class AgendaService {
  public client: Agenda

  public constructor() {
    this.client = new Agenda(Config.getAgendaConfig())
  }

  /** Starts the {@link Agenda} job processor(s). */
  public async start(): Promise<void> {
    return this.client.start()
  }

  public async scheduleRecurringReminder(
    jobName: string,
    jobData: ReminderJobData
  ): Promise<Job<ReminderJobData>> {
    const JobDataDefaults: Partial<ReminderJobData> = {
      mention: false,
      reoccuring: true,
    }

    return this.client.every(jobData.when, jobName, {
      ...JobDataDefaults,
      ...jobData,
    })
  }

  public async scheduleReminder(
    jobName: string,
    jobData: ReminderJobData
  ): Promise<Job<ReminderJobData>> {
    const JobDataDefaults: Partial<ReminderJobData> = {
      mention: false,
      reoccuring: false,
    }

    return this.client.every(jobData.when, jobName, {
      ...JobDataDefaults,
      ...jobData,
    })
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
}
