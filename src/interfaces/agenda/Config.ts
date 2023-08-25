import { Agenda, IDatabaseOptions, IDbConfig, IMongoOptions } from '@hokify/agenda'
import { AgendaService } from '@agenda/index.js'

/**
 * A type that represents the configuration for the {@link AgendaService} and, by extension,
 * {@link Agenda} itself.
 */
export type AgendaConfig = {
  name?: string
  defaultConcurrency?: number
  processEvery?: string | number
  maxConcurrency?: number
  defaultLockLimit?: number
  lockLimit?: number
  defaultLockLifetime?: number
} & (IDatabaseOptions | IMongoOptions | {}) &
  IDbConfig

/** An enum of all environment variables used by the bot, used to prevent typos. */
export enum EnvVar {
  AgendaDBUri = 'AGENDA_DB_URI',
  AgendaDBCollection = 'AGENDA_DB_COLLECTION',
  AgendaDefaultConcurrency = 'AGENDA_DEFAULT_CONCURRENCY',
}
