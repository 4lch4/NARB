import { Client } from 'discordx'

const HOMEPAGE_CHANNEL_ID = '1060314191749206068'

export class BotTools {
  public constructor(private bot: Client) {}

  public async sendImportantMessage(message: string, mention: boolean = false) {
    return mention
      ? this.sendMessage(
          HOMEPAGE_CHANNEL_ID,
          `Hey <@219270060936527873>, got an important message for ya:\n\n${message}`
        )
      : this.sendMessage(HOMEPAGE_CHANNEL_ID, `Got an important message for ya:\n\n${message}`)
  }

  public async sendMessage(channelId: string, message: string) {
    const channel = await this.bot.channels.fetch(channelId)

    if (channel?.isTextBased()) return channel.send(message)
    else return undefined
  }
}
