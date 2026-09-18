import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'
import env from '#start/env'

export default class Handler extends ExceptionHandler {
  protected debug = env.get('NODE_ENV') === 'development'

  public async handle(error: any, ctx: HttpContext) {
    // VineJS Validation Errors
    if (error instanceof vineErrors.E_VALIDATION_ERROR) {
      return ctx.response.status(422).json({
        message: 'Validation failed',
        errors: error.messages,
      })
    }

    // Handle status code exceptions if specified
    const status = error.status || 500

    if (status === 401) {
      return ctx.response.status(401).json({
        message: 'Unauthorized',
      })
    }

    if (status === 403) {
      return ctx.response.status(403).json({
        message: error.message || 'Forbidden: admin role required',
      })
    }

    if (status === 404) {
      return ctx.response.status(404).json({
        message: error.message || 'Resource not found',
      })
    }

    if (status === 400) {
      return ctx.response.status(400).json({
        message: error.message || 'Bad Request',
      })
    }

    // General fallback 500
    const responsePayload: any = {
      message: 'Internal server error',
    }

    if (this.debug) {
      responsePayload.error = error.message
    }

    return ctx.response.status(status).json(responsePayload)
  }
}
