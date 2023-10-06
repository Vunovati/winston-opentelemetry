'use_strict'

const { callWithTimeout } = require('@opentelemetry/core')

const FORCE_FLUSH_TIMEOUT_MILLIS = 30000

class MultiLogRecordProcessor {
  constructor (processors, forceFlushTimeoutMillis) {
    this.processors = processors
    this.forceFlushTimeoutMillis = forceFlushTimeoutMillis
    console.log('MultiLogRecordProcessor', processors)
  }

  async forceFlush () {
    const timeout = this.forceFlushTimeoutMillis
    await Promise.all(
      this.processors.map(processor =>
        (FORCE_FLUSH_TIMEOUT_MILLIS, callWithTimeout)(
          processor.forceFlush(),
          timeout
        )
      )
    )
  }

  onEmit (logRecord) {
    this.processors.forEach(processors => processors.onEmit(logRecord))
  }

  async shutdown () {
    await Promise.all(this.processors.map(processor => processor.shutdown()))
  }
}

exports.MultiLogRecordProcessor = MultiLogRecordProcessor
