import { expectType } from 'tsd'

import OpentelemetryTransport from '../../index'

expectType<OpentelemetryTransport>(
  new OpentelemetryTransport({
    loggerName: 'test',
    serviceVersion: '1.0.0',
    resourceAttributes: {
      key: 'value'
    },
    logRecordProcessorOptions: {
      exporterOptions: {
        protocol: 'http',
        httpExporterOptions: {
          url: 'http://localhost:55681/v1/logs'
        }
      },
      recordProcessorType: 'simple'
    }
  })
)
