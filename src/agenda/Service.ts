import { Agenda } from '@hokify/agenda'
import { AgendaConfig } from '@interfaces/index.js'
import { dirname, importx } from '@discordx/importer'
import { Client } from 'discordx'
import { ReminderJob } from './jobs/index.js'

export class AgendaService {
  public client: Agenda

  public constructor({ address, collection }: AgendaConfig) {
    this.client = new Agenda({ db: { address, collection } })
  }

  public async loadJobs(bot: Client): Promise<void> {
    const reminderJob = await ReminderJob.define(this.client, bot)
  }

  public async start(): Promise<void> {
    return this.client.start()
  }
}
