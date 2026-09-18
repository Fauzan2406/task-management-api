import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class AuditLog extends BaseModel {
  public static table = 'audit_logs'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column()
  declare action: string

  @column({ columnName: 'request_payload' })
  declare requestPayload: string

  @column({ columnName: 'response_payload' })
  declare responsePayload: string

  @column()
  declare status: 'success' | 'failed'

  @column({ columnName: 'failed_reason' })
  declare failedReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>
}
