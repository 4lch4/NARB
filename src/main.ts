import { dirname, importx } from '@discordx/importer'
import { Koa } from '@discordx/koa'
import type { Interaction, Message } from 'discord.js'
import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'
import { Agenda } from '@hokify/agenda'
import { logger } from '@4lch4/logger'
import { AgendaService } from './agenda/index.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: { prefix: '!' },
})

bot.once('ready', async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands()

  const homeChannel = await bot.channels.fetch('1060314191749206068')

  if (homeChannel?.isTextBased()) {
    const timestamp = dayjs().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss')
    homeChannel.send(`[${timestamp}]: NARB has come online...`)
  }

  // To clear all guild commands, uncomment this line,
  // This is useful when moving from guild commands to global commands
  // It must only be executed once
  //
  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log('Bot started')
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

bot.on('messageCreate', (message: Message) => {
  bot.executeCommand(message)
})

async function run() {
  // The following syntax should be used in the commonjs environment
  //
  // await importx(__dirname + "/{events,commands,api}/**/*.{ts,js}");

  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/djs/{events,commands}/**/*.{ts,js}`)

  // Let's start the bot
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw Error('Could not find the required DISCORD_BOT_TOKEN variable in your environment.')
  }

  if (!process.env.MONGODB_URI) {
    throw Error('Could not find the required MONGODB_URI variable in your environment.')
  }

  // Log in with your bot token
  await bot.login(process.env.DISCORD_BOT_TOKEN)

  const agendaService = new AgendaService({
    address: process.env.MONGODB_URI,
    collection: 'agendaJobs',
  })

  await agendaService.loadJobs(bot)

  await agendaService.start()

  // ************* rest api section: start **********

  // // api: prepare server
  // const server = new Koa()

  // // api: need to build the api server first
  // await server.build()

  // // api: let's start the server now
  // const port = process.env.PORT ?? 3000
  // server.listen(port, () => {
  //   console.log(`discord api server started on ${port}`)
  //   console.log(`visit localhost:${port}/guilds`)
  // })

  // ************* rest api section: end **********
}

run()
