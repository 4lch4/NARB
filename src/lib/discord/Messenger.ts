import { Client } from 'discordx'
import { HOMEPAGE_CHANNEL_ID, MY_USER_ID } from '../constants/index.js'

export class Messenger {
  public constructor(private bot: Client) {}

  public async sendImportantMessage(message: string, mention: boolean = false) {
    return mention
      ? this.sendMessage(
          HOMEPAGE_CHANNEL_ID,
          `Hey <@${MY_USER_ID}>, got an important message for ya:\n\n${message}`
        )
      : this.sendMessage(HOMEPAGE_CHANNEL_ID, `Got an important message for ya:\n\n${message}`)
  }

  public async sendMessage(channelId: string, message: string) {
    const channel = await this.bot.channels.fetch(channelId)

    if (channel?.isTextBased()) return channel.send(message)
    else return undefined
  }
}
