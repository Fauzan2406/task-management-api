import type { HttpContext } from '@adonisjs/core/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>, options: { roles: ('admin' | 'user')[] }) {
    const user = ctx.user

    if (!user) {
      return ctx.response.status(401).json({
        message: 'Unauthorized',
      })
    }

    if (!options.roles.includes(user.role)) {
      return ctx.response.status(403).json({
        message: 'Forbidden: admin role required',
      })
    }

    await next()
  }
}
