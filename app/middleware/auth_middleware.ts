import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import User from '#models/user'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    user?: User
  }
}

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const authHeader = ctx.request.header('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ctx.response.status(401).json({
        message: 'Unauthorized',
      })
    }

    const token = authHeader.substring(7).trim()

    try {
      const secret = env.get('JWT_SECRET')
      const payload = jwt.verify(token, secret) as { userId: number; role: string }

      const user = await User.find(payload.userId)

      if (!user) {
        return ctx.response.status(401).json({
          message: 'Unauthorized',
        })
      }

      ctx.user = user
      await next()
    } catch (error) {
      return ctx.response.status(401).json({
        message: 'Unauthorized',
      })
    }
  }
}
