import { JobNames } from '@constants/index.js'
import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination'
import { ReminderJobData } from '@interfaces/index.js'
import { DateTool } from '@lib/DateTool.js'
import { BaseCommand, DiscordTimestamps, TimestampFormat } from '@lib/index.js'
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
} from 'discord.js'
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import HumanIntervalToMS from 'human-interval'
import { ObjectId } from 'mongodb'
import { nanoid } from 'nanoid'

@Discord()
@SlashGroup({ name: 'reminders', description: 'Manage your reminders.' })
export class Reminders extends BaseCommand {
  @Slash({
    description: 'Schedule a new reminder to be sent to you in the future.',
    name: 'schedule',
  })
  @SlashGroup('reminders')
  async schedule(
    @SlashOption({
      description:
        'When to be sent your reminder, if `recurring` is true, this is treated as an interval.',
      name: 'when',
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: async interaction => {
        const input = `${interaction.options.get('when')?.value}`

        if (input.length > 1) {
          const humanInterval = DateTool.convertToHumanInterval(input)
          const timestamp = HumanIntervalToMS(humanInterval)

          // timestamp is not a number, so we can't autocomplete
          if (Number.isNaN(timestamp)) {
            interaction.respond([
              { name: 'Invalid time format...', value: 'Invalid time format...' },
            ])
          } else interaction.respond([{ name: humanInterval, value: humanInterval }])
        } else interaction.respond([{ name: 'Start Typing...', value: 'Start Typing...' }])
      },
      transformer: value => DateTool.convertToHumanInterval(value),
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
      description: 'Whether or not you would like your reminder to be recurring.',
      name: 'recurring',
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

    const jobName = recurring
      ? `${JobNames.RecurringReminder}-${nanoid(10)}`
      : `${JobNames.ScheduledReminder}-${nanoid(10)}`

    const jobData: ReminderJobData = {
      when,
      message,
      mention: mention || false,
      recurring: recurring || false,
      timezone: 'America/Chicago',
      channelId: interaction.channelId,
      userId: interaction.user.id,
    }

    this.agenda.defineReminder(jobName, interaction)
    const createdJob = await this.agenda.scheduleReminder(jobName, jobData)

    await interaction.editReply(
      `Message scheduled for ${DiscordTimestamps.getTimestamp(
        createdJob.attrs.nextRunAt || new Date(),
        TimestampFormat.RelativeTime
      )}.`
    )
  }

  @Slash({
    description: 'List the reminders you have saved.',
    name: 'list',
  })
  @SlashGroup('reminders')
  async list(interaction: CommandInteraction): Promise<void> {
    const reminders = await this.agenda.getUserActiveReminders(interaction.user.id)
    const pages: PaginationItem[] = []

    for (let x = 0; x < reminders.length; x++) {
      if (reminders[x].attrs.nextRunAt) {
        const embed = new EmbedBuilder()
          .setTitle(reminders[x].attrs.data.message)
          .setDescription(
            DiscordTimestamps.getTimestamp(
              reminders[x].attrs.nextRunAt,
              TimestampFormat.ShortDateTime
            )
          )
          .setFooter({ text: `Reminder ${x + 1} of ${reminders.length}` })

        pages.push({ embeds: [embed] })
      }
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

  private async remindersAutocomplete(interaction: AutocompleteInteraction) {
    const remindersData = await this.agenda.getUserActiveReminders(interaction.user.id)
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
    if (interaction.isAutocomplete()) this.remindersAutocomplete(interaction)
    else {
      this.logger.info(`[NewReminder#delete]: Reminder ID: ${reminder}`)

      const objectId = new ObjectId(reminder)

      const cancelRes = await this.agenda.cancel({ _id: objectId })

      await interaction.reply({
        content: `Successfully deleted reminder!\n\n**${cancelRes}**`,
        ephemeral: true,
      })
    }
  }
}
