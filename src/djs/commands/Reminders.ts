import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination'
import type {
  CommandInteraction,
  Channel,
  ButtonInteraction,
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
} from 'discord.js'
import { nanoid } from 'nanoid'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageActionRowComponentBuilder,
} from 'discord.js'
import {
  ApplicationCommandOptions,
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

const agenda = new AgendaService()

@Discord()
@SlashGroup({ name: 'reminders', description: 'Manage your reminders.' })
export class NewReminder {
  @Slash({
    description: 'Create a new reminder.',
    name: 'create',
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
      description: 'How often to be sent your reminder.',
      name: 'interval',
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    interval: string | undefined,

    @SlashOption({
      description: 'Whether or not you would like to be mentioned in your reminder.',
      name: 'mention',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    mention: boolean | undefined,

    interaction: CommandInteraction
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true })

    logger.info(`[NewReminder#create]: When: ${when}`)
    logger.info(`[NewReminder#create]: What: ${message}`)
    logger.info(`[NewReminder#create]: Interval: ${interval}`)
    logger.info(`[NewReminder#create]: JobNames.BasicReminder = ${JobNames.BasicReminder}`)

    const jobName = `${JobNames.BasicReminder}-${nanoid(10)}`

    agenda.client.define(jobName, async (job: Job<ReminderJobData>) => {
      const { channelId, message, userId, when, mention } = job.attrs.data

      logger.debug(`[ReminderJob#define:run]: Within the ${JobNames.BasicReminder} job...`)
      logger.debug(`[ReminderJob#define:run]: Channel ID: ${channelId}`)
      logger.debug(`[ReminderJob#define:run]: Message: ${message}`)
      logger.debug(`[ReminderJob#define:run]: User ID: ${userId}`)
      logger.debug(`[ReminderJob#define:run]: When: ${when}`)

      const channel = await interaction.client.channels.fetch(channelId)

      if (channel?.isTextBased()) {
        if (mention) return channel.send(`<@${userId}>: ${message}`)
        else return channel.send(message)
      }
    })

    // agenda.client.

    await agenda.client.every(
      when,
      jobName,
      {
        when,
        message,
        mention: mention || false,
        channelId: interaction.channelId,
        userId: interaction.user.id,
      },
      { skipImmediate: true }
    )

    await agenda.start()

    await interaction.editReply(`When: ${when}, What: ${message}`)
  }

  @Slash({
    description: 'List the reminders you have saved.',
    name: 'list',
  })
  @SlashGroup('reminders')
  async list(interaction: CommandInteraction): Promise<void> {
    // await interaction.deferReply({ ephemeral: true })

    const reminders = await agenda.getUserReminders(interaction.user.id)
    const pages: PaginationItem[] = []

    for (let x = 0; x < reminders.length; x++) {
      const embed = new EmbedBuilder()
        .setTitle(`Reminders for **${interaction.user.username}**`)
        .setDescription(
          `**Message**: ${reminders[x].attrs.data.message}\n\n**When**: ${reminders[x].attrs.data.when}`
        )
        .setFooter({ text: `Reminder ${x + 1} of ${reminders.length}` })
      // .addFields({ name: 'When', value: reminders[x].attrs.data.when, inline: true })

      pages.push({ embeds: [embed] })
    }

    if (pages.length > 0) {
      const pagination = new Pagination(interaction, pages, {
        filter: interact => interact.user.id === interaction.user.id,
        type: PaginationType.Button,
        ephemeral: true,
      })
      await pagination.send()
    } else await interaction.reply(`No reminders found.`)
  }

  private async deleteAutocomplete(interaction: AutocompleteInteraction) {
    const remindersData = await agenda.getUserReminders(interaction.user.id)
    const remindersMap: ApplicationCommandOptionChoiceData<string | number>[] = []

    for (let x = 0; x < remindersData.length; x++) {
      if (remindersData[x].attrs._id) {
        const value = `${remindersData[x].attrs._id?.toString()}`
        const name =
          `${remindersData[x].attrs.data.when} - ${remindersData[x].attrs.data.message}`.substring(
            0,
            100
          )

        remindersMap.push({ name, value })
      }
    }

    interaction.respond(remindersMap)
  }

  @Slash({
    description: 'Delete an existing reminder.',
    name: 'delete',
  })
  @SlashGroup('reminders')
  async delete(
    @SlashOption({
      description: 'The reminder to delete/cancel.',
      name: 'reminder',
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: true,
    })
    reminder: string,

    interaction: CommandInteraction | AutocompleteInteraction
  ): Promise<void> {
    if (interaction.isAutocomplete()) this.deleteAutocomplete(interaction)
    else {
      // await interaction.deferReply({ ephemeral: true })

      logger.info(`[NewReminder#delete]: Reminder ID: ${reminder}`)

      const objectId = new ObjectId(reminder)

      const reminderJob = await agenda.getReminders({ _id: objectId }, undefined, 1)

      await reminderJob[0].remove()

      await interaction.reply({
        content: `Successfully deleted reminder!\n\n**${reminderJob[0].attrs.data.message}**`,
        ephemeral: true,
      })
    }
  }
}
