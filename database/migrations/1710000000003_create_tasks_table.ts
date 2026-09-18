import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.enum('status', ['todo', 'in_progress', 'done']).notNullable().defaultTo('todo')
      table.enum('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium')
      table.integer('assignee_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
