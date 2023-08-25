import { logger } from '@4lch4/logger'
import { JobNames } from '@agenda/Constants.js'
import { AgendaService } from '@agenda/index.js'
import { Pagination, PaginationItem, PaginationType } from '@discordx/pagination'
import { Job } from '@hokify/agenda'
import { ReminderJobData } from '@interfaces/index.js'
import type {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
} from 'discord.js'
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import {
  Discord,
  SimpleCommand,
  SimpleCommandMessage,
  Slash,
  SlashGroup,
  SlashOption,
} from 'discordx'
import { ObjectId } from 'mongodb'
import { nanoid } from 'nanoid'

const agenda = new AgendaService()

@Discord()
export class SimpleCommands {
  @SimpleCommand({
    aliases: ['h'],
  })
  hello(command: SimpleCommandMessage): void {
    command.message.reply(`👋 ${command.message.member}`)
  }

  @SimpleCommand({
    aliases: ['e'],
  })
  error(command: SimpleCommandMessage): void {
    // command.message.reply(`❌ ${command.message.member}`)
    throw new Error('Test Error')
  }
}
