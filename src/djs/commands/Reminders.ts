import { logger } from '@4lch4/logger'
import { JobNames } from '@agenda/Constants.js'
import { AgendaService } from '@agenda/index.js'
import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination'
import { Job } from '@hokify/agenda'
import { ReminderJobData } from '@interfaces/index.js'
import { DateTool } from '@lib/DateTool.js'
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
} from 'discord.js'
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import {
  Discord,
  NotEmpty,
  Slash,
  SlashGroup,
  SlashGroupOptions,
  SlashOption,
  VerifyName,
} from 'discordx'
import { ObjectId } from 'mongodb'
import { nanoid } from 'nanoid'

const agenda = new AgendaService()

@Discord()
@SlashGroup({ name: 'reminders', description: 'Manage your reminders.' })
export class NewReminder {
  @Slash({
    description: 'Schedule a new reminder to be sent to you in the future.',
    name: 'schedule',
  })
  @SlashGroup('reminders')
  async schedule(
    @SlashOption({
      description:
        'When to be sent your reminder, if `reoccurring` is true, this is treated as an interval.',
      name: 'when',
      required: true,
      type: ApplicationCommandOptionType.String,
      transformer: (value: string) => DateTool.convertToHumanInterval(value),
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
      description: 'Whether or not you would like your reminder to be reoccurring.',
      name: 'reoccurring',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    })
    recurring: boolean | undefined,

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

    const jobName = `${JobNames.BasicReminder}-${nanoid(10)}`

    const jobData: ReminderJobData = {
      when,
      message,
      mention: mention || false,
      recurring: recurring || false,
      timezone: 'America/Chicago',
      channelId: interaction.channelId,
      userId: interaction.user.id,
    }

    await agenda.defineReminder(jobName, interaction)

    await agenda.scheduleReminder(jobName, jobData)

    await interaction.editReply(`Message scheduled for \`${when}\`.`)
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
