import { dirname, importx } from '@discordx/importer'
import { Agenda } from '@hokify/agenda'
import { Config } from '@lib/index.js'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone.js'
import utc from 'dayjs/plugin/utc.js'
import type { Interaction, Message } from 'discord.js'
import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'
import { AgendaService } from './agenda/index.js'
import { Messenger, logger } from './lib/index.js'

dayjs.extend(utc)
dayjs.extend(timezone)

export const bot = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
  ],

  // Debug logs are disabled in silent mode
  silent: false,
})

const messaging = new Messenger(bot)

bot.once('ready', async () => {
  // Make sure all guilds are cached
  // await bot.guilds.fetch();

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands()

  const timestamp = dayjs().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss')

  await messaging.sendImportantMessage(`Server has come **ONLINE** @ \`${timestamp}\`...`)

  logger.info(`NARB has come online @ ${timestamp}...`)
})

bot.on('debug', (message: string) => {
  logger.debug(`[ClientEvent:debug]: ${message}`)
})

bot.on('warn', (message: string) => {
  logger.warn(`[ClientEvent:warn]: ${message}`)
})

bot.on('error', (error: Error) => {
  logger.error(`[ClientEvent:error]: ${JSON.stringify(error, null, 2)}`)
})

process.on('SIGTERM', async () => {
  const timestamp = dayjs().tz('America/Chicago').format('YYYY-MM-DD HH:mm:ss')

  await messaging.sendImportantMessage(`Server is going **OFFLINE** @ \`${timestamp}\`...`)

  logger.info('SIGTERM signal received.')

  process.exit(0)
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

  // Log in with your bot token
  await bot.login(process.env.DISCORD_BOT_TOKEN)

  const agendaService = new AgendaService()

  await agendaService.start()

  await agendaService.initCleanupJob()
  await agendaService.reloadReminders(bot)

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
