import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

const APP_ROOT = new URL('../', import.meta.url)

new Ignitor(APP_ROOT, {
  importer: (filePath) => import(filePath),
})
  .tap((app) => {
    app.listen('SIGTERM', () => app.terminate())
    app.listen('SIGINT', () => app.terminate())
  })
  .ace()
  .handle(process.argv.slice(2))
  .catch((error) => {
    prettyPrintError(error)
    process.exitCode = 1
  })
