import env from '#start/env'
import { Secret } from '@adonisjs/core/helpers'

export const appKey = new Secret(env.get('APP_KEY'))

export const http = {
  generateRequestId: true,
  allowMethodSpoofing: false,
}
