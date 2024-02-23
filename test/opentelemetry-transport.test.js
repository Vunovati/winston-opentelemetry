'use strict'

const { join } = require('path')
const { test, before } = require('tap')
const { Wait, GenericContainer } = require('testcontainers')
const { extract } = require('tar-stream')
const { text } = require('node:stream/consumers')
const { setInterval } = require('node:timers/promises')
const winston = require('winston')
const OpentelemetryTransport = require('..')

const LOG_FILE_PATH = '/etc/test-logs/otlp-logs.log'

let container

before(async () => {
  container = await new GenericContainer(
    'otel/opentelemetry-collector-contrib:latest'
  )
    .withCopyFilesToContainer([
      {
        source: join(__dirname, 'otel-collector-config.yaml'),
        target: '/etc/otel-collector-config.yaml'
      }
    ])
    .withExposedPorts({
      container: 4317,
      host: 4317
    })
    .withExposedPorts({
      container: 4318,
      host: 4318
    })
    .withCommand(['--config=/etc/otel-collector-config.yaml'])
    .withWaitStrategy(Wait.forLogMessage('Everything is ready'))
    .withCopyContentToContainer([
      {
        content: '',
        target: LOG_FILE_PATH,
        mode: parseInt('0777', 8)
      }
    ])
    .start()
})

test('translate Winston log format to Open Telemetry data format for each log level', async ({
  hasStrict
}) => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new OpentelemetryTransport({
        loggerName: 'test-logger-name',
        resourceAttributes: {
          'service.name': 'test-service',
          'service.version': 'test-service-version'
        },
        serviceVersion: 'test-service-version',
        logRecordProcessorOptions: {
          recordProcessorType: 'simple',
          exporterOptions: {
            protocol: 'grpc'
          }
        }
      })
    ]
  })

  logger.info('test info')
  logger.warn('test warn')
  logger.error('test error')

  const expectedResourceAttributes = [
    {
      key: 'service.name',
      value: {
        stringValue: 'test-service'
      }
    },
    {
      key: 'service.version',
      value: {
        stringValue: 'test-service-version'
      }
    }
  ]

  const scope = {
    name: 'test-logger-name',
    version: 'test-service-version'
  }

  const expectedLines = [
    {
      severityNumber: 9,
      severityText: 'INFO',
      body: { stringValue: 'test info' },
      traceId: '',
      spanId: ''
    },
    {
      severityNumber: 13,
      severityText: 'WARN',
      body: { stringValue: 'test warn' },
      traceId: '',
      spanId: ''
    },
    {
      severityNumber: 17,
      severityText: 'ERROR',
      body: { stringValue: 'test error' },
      traceId: '',
      spanId: ''
    }
  ]

  const logs = await container.logs()
  let logRecordReceivedOnCollectorCount = 0

  logs
    .on('data', line => {
      if (line.includes('LogRecord')) {
        logRecordReceivedOnCollectorCount++
      }
    })
    .on('err', line => console.error(line))

  for await (const _ of setInterval(0)) { //eslint-disable-line
    if (logRecordReceivedOnCollectorCount >= expectedLines.length) {
      break
    }
  }

  const stoppedContainer = await container.stop({ remove: false })

  const tarArchiveStream = await stoppedContainer.copyArchiveFromContainer(
    LOG_FILE_PATH
  )

  const extractedArchiveStream = extract()

  tarArchiveStream.pipe(extractedArchiveStream)

  const archivedFileContents = []

  for await (const entry of extractedArchiveStream) {
    const fileContent = await text(entry)
    archivedFileContents.push(fileContent)
  }

  const content = archivedFileContents.join('\n')

  const lines = content.split('\n').filter(Boolean)

  lines.forEach(line => {
    const foundAttributes = JSON.parse(
      line
    ).resourceLogs?.[0]?.resource.attributes.filter(
      attribute =>
        attribute.key === 'service.name' || attribute.key === 'service.version'
    )
    hasStrict(foundAttributes, expectedResourceAttributes)
  })

  lines.forEach(line => {
    hasStrict(JSON.parse(line).resourceLogs?.[0]?.scopeLogs?.[0]?.scope, scope)
  })

  const logRecords = [...lines.entries()]
    .map(([_lineNumber, logLine]) => {
      return JSON.parse(logLine).resourceLogs?.[0]?.scopeLogs?.[0]
        ?.logRecords?.[0]
    })
    .sort((a, b) => {
      return a.severityNumber - b.severityNumber
    })

  for (let i = 0; i < logRecords.length; i++) {
    const logRecord = logRecords[i]
    const expectedLine = expectedLines[i]
    hasStrict(logRecord, expectedLine, `line ${i} is mapped correctly`)
  }
})
