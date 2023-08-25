import { Client } from 'discordx'

const HOMEPAGE_CHANNEL_ID = '1060314191749206068'

export class BotTools {
  // private agenda: AgendaService
  // private bot: Client

  public constructor(private bot: Client) {}

  public async sendImportantMessage(message: string) {
    return this.sendMessage(
      HOMEPAGE_CHANNEL_ID,
      `Hey <@219270060936527873>, got an important message for ya:\n\n${message}`
    )
  }

  public async sendMessage(channelId: string, message: string) {
    const channel = await this.bot.channels.fetch(channelId)

    if (channel?.isTextBased()) return channel.send(message)
    else return undefined
  }
}
