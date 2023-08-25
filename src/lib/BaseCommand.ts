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
import { RemindersOptions } from '@constants/index.js'
import HumanIntervalToMS from 'human-interval'

const agenda = new AgendaService()

export abstract class BaseCommand {
  protected agenda = new AgendaService()
}
