import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Project from '#models/project'
import Task from '#models/task'
import AuditLog from '#models/audit_log'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'admin' | 'user'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Project, { foreignKey: 'createdBy' })
  declare projects: HasMany<typeof Project>

  @hasMany(() => Task, { foreignKey: 'assigneeId' })
  declare assignedTasks: HasMany<typeof Task>

  @hasMany(() => AuditLog, { foreignKey: 'userId' })
  declare auditLogs: HasMany<typeof AuditLog>

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
