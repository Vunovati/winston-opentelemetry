const winston = require('winston')
const OpentelemetryTransport = require('..')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new OpentelemetryTransport({
      loggerName: 'winston-opentelemetry-example',
      serviceVersion: '1.0.0',
      resourceAttributes: {
        'service.name': 'winston-opentelemetry-example-app'
      },
      logRecordProcessorOptions: [
        {
          exporterOptions: {
            protocol: 'http'
          },
          recordProcessorType: 'batch',
          processorConfig: {
            maxExportBatchSize: 1
          }
        },
        {
          exporterOptions: {
            protocol: 'console'
          },
          recordProcessorType: 'simple'
        }
      ]
    })
  ]
})

setInterval(() => {
  logger.info('Hello distributed logs')
  logger.warn('Hello distributed logs')
}, 1000)
