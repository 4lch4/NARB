import { Pagination, PaginationItem } from '@discordx/pagination'
import type { CommandInteraction, Channel, ButtonInteraction } from 'discord.js'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from 'discord.js'
import {
  ButtonComponent,
  Discord,
  MetadataStorage,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
} from 'discordx'
import { AgendaService } from '@agenda/index.js'
import { logger } from '@4lch4/logger'
import { JobNames } from '@agenda/Constants.js'
import { ObjectId } from 'mongodb'
import { ReminderJobData } from '@interfaces/index.js'
import { Job } from '@hokify/agenda'

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

    agenda.client.define(`${JobNames.BasicReminder}-${interaction.id}`, async (job: Job<ReminderJobData>) => {
      const { channelId, message, userId, when } = job.attrs.data

      logger.debug(`[ReminderJob#define:run]: Within the ${JobNames.BasicReminder} job...`)
      logger.debug(`[ReminderJob#define:run]: Channel ID: ${channelId}`)
      logger.debug(`[ReminderJob#define:run]: Message: ${message}`)
      logger.debug(`[ReminderJob#define:run]: User ID: ${userId}`)
      logger.debug(`[ReminderJob#define:run]: When: ${when}`)

      const channel = await interaction.client.channels.fetch(channelId)

      if (channel?.isTextBased()) {
        if (channel.isDMBased()) return channel.send(message)
        else return channel.send(`<@${userId}>: ${message}`)
      }
    })

    await agenda.client.every(when, `${JobNames.BasicReminder}-${interaction.id}`, {
      when,
      message,
      channelId: interaction.channelId,
      userId: interaction.user.id,
    })

    await interaction.reply(`When: ${when}, What: ${message}`)
    // interaction.reply(`When: ${when}, What: ${what}`)
  }

  @ButtonComponent({ id: 'deleteBtn' })
  async deleteBtn(interaction: ButtonInteraction): Promise<void> {
    logger.info(`[NewReminder#deleteBtn]: Interaction...`)

    const jobId = interaction.message.embeds[0].fields.find(field => field.name === 'JobID')?.value

    if (jobId) {
      logger.success(`[NewReminder#deleteBtn]: Cancelling JobID: ${jobId}`)
      await agenda.client.cancel({ _id: new ObjectId(jobId) })

      await interaction.message.edit(`JobID: ${jobId} cancelled.`)

      // await interaction.editReply(`JobID: ${jobId} cancelled.`)

      // await interaction.reply(`JobID: ${jobId} cancelled.`)
    }

    // console.log(JSON.stringify(interaction.message, null, 2))
    // console.log(JSON.stringify(interaction.component, null, 2))
  }

  @Slash({
    description: 'List the reminders you have saved.',
    name: 'list',
  })
  @SlashGroup('reminders')
  async list(interaction: CommandInteraction): Promise<void> {
    const jobs = (await agenda.client.jobs({
      'data.userId': interaction.user.id,
    })) as Job<ReminderJobData>[]

    const pages: PaginationItem[] = []

    for (let x = 0; x < jobs.length; x++) {
      const job = jobs[x]
      const embed = new EmbedBuilder()
        .setTitle(`Reminder ${x + 1}`)
        .setDescription(job.attrs.data.message)
        .setFooter({ text: `Page ${x + 1} of ${jobs.length}` })
        .addFields({ name: 'When', value: job.attrs.data.when, inline: true })
        .addFields({ name: 'JobID', value: `${job.attrs._id?.toString()}`, inline: true })

      const components = [
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
          new ButtonBuilder({
            customId: 'deleteBtn',
            label: 'Delete',
            style: ButtonStyle.Danger,
          }),
        ]),
      ]

      pages.push({ embeds: [embed], components })
    }

    // const pages: PaginationItem[] = jobs.map((job, i) => {
    //   const embed = new EmbedBuilder()
    //     .setFooter({ text: `Page ${i + 1} of ${jobs.length}` })
    //     .setTitle(`Job ${job.attrs._id}`)
    //     .addFields({ name: 'Message', value: job.attrs.data.message })
    //     .addFields({ name: 'When', value: job.attrs.data.when })
    //     .addFields({ name: 'ChannelID', value: job.attrs.data.channelId })
    //     .addFields({ name: 'UserID', value: job.attrs.data.userId })
    //     .addFields({ name: 'JobID', value: `${job.attrs._id?.toString()}` })
    //     .setDescription(`Just a test description...`)

    //   const components = [
    //     new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents([
    //       new ButtonBuilder({
    //         customId: 'deleteBtn',
    //         label: 'Delete',
    //         style: ButtonStyle.Danger,
    //       }),
    //     ]),
    //   ]

    //   return { embeds: [embed], components }
    // })

    if (pages.length > 0) {
      const pagination = new Pagination(interaction, pages)
      const collection = await pagination.send()
    } else {
      await interaction.reply(`No reminders found.`)
    }

    // await interaction.reply(`Count = ${jobs.length}`)
    // interaction.reply(`When: ${when}, What: ${what}`)
  }

  @Slash({
    description: 'Delete an existing reminder.',
    name: 'delete',
  })
  @SlashGroup('reminders')
  async delete(
    @SlashOption({
      description: 'The ID of the reminder to delete.',
      name: 'id',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    id: string,

    interaction: CommandInteraction
  ): Promise<void> {
    logger.info(`[NewReminder#delete]: ID: ${id}`)

    const objectId = new ObjectId(id)

    await agenda.client.cancel({ _id: objectId })

    await interaction.reply(`ID: ${id}`)
  }
}
