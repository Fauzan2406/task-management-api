import env from '#start/env'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',
  loggers: {
    app: {
      enabled: true,
      name: 'adonis-app',
      level: env.get('LOG_LEVEL', 'info'),
      transport: {
        targets: [
          targets.pretty()
        ]
      }
    }
  }
})

export default loggerConfig

declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
