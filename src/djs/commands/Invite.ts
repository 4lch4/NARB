import { BaseCommand } from '@lib/BaseCommand.js'
import { CommandInteraction } from 'discord.js'
import { Discord, Slash } from 'discordx'

@Discord()
export class Invite extends BaseCommand {
  @Slash({
    description: 'Get the invite link for the bot.',
    name: 'invite',
  })
  async invite(interaction: CommandInteraction) {
    return interaction.reply({
      embeds: [
        {
          description: `You can invite me to your server by clicking [here](https://discord.com/api/oauth2/authorize?client_id=1143675516965097472&permissions=380104869952&scope=bot).`,
          title: 'Invite Me',
        },
      ],
    })
  }
}
