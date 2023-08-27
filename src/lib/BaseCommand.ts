import { AgendaService } from '@agenda/index.js'
import { logger } from '@lib/index.js'

export abstract class BaseCommand {
  protected agenda = new AgendaService()
  protected logger = logger
}
