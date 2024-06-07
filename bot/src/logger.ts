import winston from 'winston'
import 'winston-daily-rotate-file'
import DiscordTransport from 'winston-discord-transport'

process.on('uncaughtException', (error, origin) => {
  logError(error, origin)
})

process.on('unhandledRejection', (error, promise) => {
  logError(error, promise)
})

// eslint-disable-next-line new-cap
const discordTransport = new DiscordTransport.default({
  webhook: process.env.LOGS_WEBHOOK as string,
  defaultMeta: {},
  level: 'error'
})

const errorTransport = new winston.transports.DailyRotateFile({
  level: 'error',
  dirname: process.env.NODE_ENV === 'production' ? 'logs_prod' : 'logs_dev',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

const infoTransport = new winston.transports.DailyRotateFile({
  level: 'info',
  dirname: process.env.NODE_ENV === 'production' ? 'logs_prod' : 'logs_dev',
  filename: 'info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    discordTransport,
    errorTransport,
    infoTransport
  ]
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export function logError (error: unknown, metaData: any): void {
  if (error instanceof Error) {
    logger.error('unhandledRejection', {
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      additional: metaData
    })
  } else if (typeof error === 'string') {
    logger.error(`## ${error}
${typeof metaData === 'object' ? JSON.stringify(metaData, null, 2) : metaData}`)
  } else {
    logger.error('unhandledRejection', {
      error,
      additional: metaData
    })
  }
}

export default logger
