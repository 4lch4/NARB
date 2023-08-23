import { Pagination } from '@discordx/pagination'
import type { CommandInteraction, Channel } from 'discord.js'
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Discord, MetadataStorage, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx'
import { AgendaService } from '@agenda/index.js'
import { logger } from '@4lch4/logger'
import { JobNames } from '@agenda/Constants.js'


const agenda = new AgendaService({ address: process.env.MONGODB_URI!, collection: 'agendaJobs' })

@Discord()
@SlashGroup({ name: 'reminders', description: 'Manage your reminders.' })
export class NewReminder {
  @Slash({
    description: 'Test agenda.',
    name: 'new',
  })
  @SlashGroup('reminders')
  async create(
    @SlashOption({
      description: 'When to be sent your reminder.',
      name: 'when',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    when: string,

    @SlashOption({
      description: 'The message to be sent in your reminder.',
      name: 'message',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    message: string,

    @SlashOption({
      description: '(**Premium Feature**) How often to be sent your reminder.',
      name: 'interval',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    interval: string | undefined,

    interaction: CommandInteraction
  ): Promise<void> {
    logger.info(`[NewReminder#create]: When: ${when}`)
    logger.info(`[NewReminder#create]: What: ${message}`)
    logger.info(`[NewReminder#create]: Interval: ${interval}`)
    logger.info(`[NewReminder#create]: JobNames.BasicReminder = ${JobNames.BasicReminder}`)

    await agenda.client.every(when, JobNames.BasicReminder, {
      when,
      what: message,
      channelId: interaction.channelId,
    })

    await interaction.reply(`When: ${when}, What: ${message}`)
    // interaction.reply(`When: ${when}, What: ${what}`)
  }

  @Slash({
    description: 'List the reminders you have saved.',
    name: 'list',
  })
  async list(interaction: CommandInteraction): Promise<void> {
    const jobs = await agenda.client.jobs({ name: 'test-send' })

    console.log(jobs)

    await interaction.reply(`Count = ${jobs.length}`)
    // interaction.reply(`When: ${when}, What: ${what}`)
  }
}
