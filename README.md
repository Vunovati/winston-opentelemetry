# winston-opentelemetry
[![npm version](https://img.shields.io/npm/v/winston-opentelemetry)](https://www.npmjs.com/package/winston-opentelemetry)
[![Build Status](https://img.shields.io/github/workflow/status/Vunovati/winston-opentelemetry/CI)](https://github.com/Vunovati/winston-opentelemetry/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/Vunovati/winston-opentelemetry/badge.svg)](https://snyk.io/test/Vunovati/winston-opentelemetry)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Winston transport for OpenTelemetry. Outputs logs in the [OpenTelemetry Log Data Model](https://github.com/open-telemetry/opentelemetry-specification/blob/fc8289b8879f3a37e1eba5b4e445c94e74b20359/specification/logs/data-model.md) and sends them to an OTLP logs collector.

## Install

```
npm i winston-opentelemetry
```

## Configuration
### Protocol
can be set to `http/protobuf`, `grpc`, `http` or `console` by using 

* env var `OTEL_EXPORTER_OTLP_PROTOCOL` 
* env var `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`
* setting the exporterProtocol option

Settings configured programmatically take precedence over environment variables. Per-signal environment variables take precedence over non-per-signal environment variables. This principle applies to all the configurations in this module.

If no protocol is specified, `http/protobuf` is used as a default.

### Exporter settings

#### Collector URL

Set either of the following environment variables:
`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`,
`OTEL_EXPORTER_OTLP_ENDPOINT`

#### Protocol-specific exporter configuration

#### `http/protobuf`
[Env vars in README](https://github.com/open-telemetry/opentelemetry-js/blob/d4a41bd815dd50703f692000a70c59235ad71959/experimental/packages/exporter-trace-otlp-proto/README.md#exporter-timeout-configuration)

#### `grpc`
[Environment Variable Configuration](https://github.com/open-telemetry/opentelemetry-js/blob/d4a41bd815dd50703f692000a70c59235ad71959/experimental/packages/exporter-logs-otlp-grpc/README.md#environment-variable-configuration)

#### `http`
[Env vars in README](https://github.com/open-telemetry/opentelemetry-js/blob/d4a41bd815dd50703f692000a70c59235ad71959/experimental/packages/exporter-trace-otlp-http/README.md#configuration-options-as-environment-variables)


#### Processor-specific configuration
If batch log processor is selected (is default), it can be configured using env vars described in the [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#batch-logrecord-processor)

### Options
When using the transport, the following options can be used to configure the transport programmatically:

* `loggerName`: name to be used by the OpenTelemetry logger
* `serviceVersion`: name to be used by the OpenTelemetry logger
* `resourceAttributes`: Object containing [resource attributes](https://opentelemetry.io/docs/instrumentation/js/resources/). Optional
* `logRecordProcessorOptions`: a single object or an array of objects specifying the LogProcessor and LogExporter types and constructor params. Optional


## Usage

### Examples
* [Basic](./examples)

## License

MIT
