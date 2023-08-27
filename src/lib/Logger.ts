import { WinstonTransport } from '@axiomhq/winston'
import { arch, platform } from 'os'
import Winston, { transports as WinstonTransports } from 'winston'

export const logger = Winston.createLogger({
  defaultMeta: {
    service: process.env.APP_NAME || process.env.API_NAME || '@4lch4/narb',
    appVersion: process.env.APP_VERSION || process.env.API_VERSION || '0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || 'localhost',
    arch: arch(),
    platform: platform(),
  },
  level: process.env.LOG_LEVEL || 'debug',
  transports: [
    new WinstonTransport({
      dataset: process.env.AXIOM_DATA_SET,
      token: process.env.AXIOM_TOKEN,
      orgId: process.env.AXIOM_ORG_ID,
    }),
    new WinstonTransports.Console({
      format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
    }),
  ],
})
