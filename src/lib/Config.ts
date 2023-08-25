import { AgendaConfig, EnvVar } from '@interfaces/index.js'

const Defaults: { [key: string]: string } = {
  [EnvVar.AgendaDefaultConcurrency]: '5',
}

export class Config {
  public static getEnv(key: EnvVar): string {
    const value = process.env[key] || Defaults[key]

    if (value) return value
    else throw new Error(`${key} is not defined.`)
  }

  public static getAgendaConfig(): AgendaConfig {
    const address = this.getEnv(EnvVar.AgendaDBUri)
    const collection = this.getEnv(EnvVar.AgendaDBCollection)
    const defaultConcurrency = parseInt(this.getEnv(EnvVar.AgendaDefaultConcurrency))

    return { defaultConcurrency, db: { address, collection } }
  }
}
