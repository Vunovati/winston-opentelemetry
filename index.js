'use strict'

const Transport = require('winston-transport')
const { getOtlpLogger } = require('otlp-logger')
const { SeverityNumber } = require('@opentelemetry/api-logs') // TODO: optional import

module.exports = class OpentelemetryTransport extends Transport {
  /**
   * @typedef {Object} Options
   * @property {string} loggerName
   * @property {string} serviceVersion
   * @property {Object} [resourceAttributes={}]
   * @property {import('./lib/create-log-processor').LogRecordProcessorOptions | import('./lib/create-log-processor').LogRecordProcessorOptions[]} [logRecordProcessorOptions]
   *
   * @param {Options} opts
   */
  constructor (opts) {
    super(opts)
    this.logger = getOtlpLogger(opts)
  }

  log (info, callback) {
    setImmediate(() => {
      this.emit('logged', info.message)
    })

    this.logger.emit(toOpenTelemetry(info))
    callback()
  }
}

/**
 * Converts a winston log object to an OpenTelemetry log object.
 *
 * @param {import('winston').LogEntry} logEntry
 * @returns {import('@opentelemetry/api-logs').LogRecord}
 */
function toOpenTelemetry (logEntry) {
  const severityNumber = mapLogLevelToSeverityNumber(logEntry.level)
  const severityText = SEVERITY_NAME_MAP[severityNumber]

  return {
    body: logEntry.message,
    severityNumber,
    severityText
  }
}

/**
 * Converts a winston log entry level to an OpenTelemetry log level.
 *
 * @param {import('winston').LogEntry['level']} level
 * @returns {import('@opentelemetry/api-logs').LogRecord['severityNumber']}
 */
function mapLogLevelToSeverityNumber (level) {
  switch (level) {
    case 'error':
      return SeverityNumber.ERROR
    case 'warn':
      return SeverityNumber.WARN
    case 'info':
      return SeverityNumber.INFO
  }
}

// https://github.com/open-telemetry/opentelemetry-specification/blob/fc8289b8879f3a37e1eba5b4e445c94e74b20359/specification/logs/data-model.md#displaying-severity
const SEVERITY_NAME_MAP = {
  1: 'TRACE',
  2: 'TRACE2',
  3: 'TRACE3',
  4: 'TRACE4',
  5: 'DEBUG',
  6: 'DEBUG2',
  7: 'DEBUG3',
  8: 'DEBUG4',
  9: 'INFO',
  10: 'INFO2',
  11: 'INFO3',
  12: 'INFO4',
  13: 'WARN',
  14: 'WARN2',
  15: 'WARN3',
  16: 'WARN4',
  17: 'ERROR',
  18: 'ERROR2',
  19: 'ERROR3',
  20: 'ERROR4',
  21: 'FATAL',
  22: 'FATAL2',
  23: 'FATAL3',
  24: 'FATAL4'
}
