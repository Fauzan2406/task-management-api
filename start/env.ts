import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string.optional(),
  LOG_LEVEL: Env.schema.string.optional(),
  APP_KEY: Env.schema.string(),

  DB_CONNECTION: Env.schema.string(),
  PG_HOST: Env.schema.string(),
  PG_PORT: Env.schema.number(),
  PG_USER: Env.schema.string(),
  PG_PASSWORD: Env.schema.string.optional(),
  PG_DB_NAME: Env.schema.string(),

  JWT_SECRET: Env.schema.string(),
  GEMINI_API_KEY: Env.schema.string.optional()
})
