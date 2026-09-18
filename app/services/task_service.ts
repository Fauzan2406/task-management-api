import db from '@adonisjs/lucid/services/db'
import Task from '#models/task'
import Project from '#models/project'
import User from '#models/user'
import { AIOperation } from '#services/ai_service'

export interface OperationResult {
  action: string
  task_id?: number
  details?: any
}

export default class TaskService {
  /**
   * Validates operations schema, types, enum values, and foreign key DB existence.
   * Throws Error with clear explanation if invalid.
   */
  public async validateOperations(operations: AIOperation[]): Promise<void> {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('AI returned an empty or invalid operations list')
    }

    const validActions = ['CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK']
    const validStatuses = ['todo', 'in_progress', 'done']
    const validPriorities = ['low', 'medium', 'high']

    for (let index = 0; index < operations.length; index++) {
      const op = operations[index]
      const opIndexStr = `Operation #${index + 1}`

      if (!op || typeof op !== 'object') {
        throw new Error(`${opIndexStr} is invalid`)
      }

      if (!validActions.includes(op.action)) {
        throw new Error(`${opIndexStr} contains invalid action "${op.action}"`)
      }

      if (op.action === 'CREATE_TASK') {
        if (!op.data || typeof op.data !== 'object') {
          throw new Error(`${opIndexStr} CREATE_TASK missing data payload`)
        }

        const { project_id, title, status, priority, assignee_id } = op.data

        if (!project_id || typeof project_id !== 'number') {
          throw new Error(`${opIndexStr} CREATE_TASK requires numeric project_id`)
        }

        const projectExists = await Project.find(project_id)
        if (!projectExists) {
          throw new Error(`${opIndexStr} references non-existent project_id ${project_id}`)
        }

        if (!title || typeof title !== 'string' || title.trim() === '') {
          throw new Error(`${opIndexStr} CREATE_TASK requires valid title string`)
        }

        if (status && !validStatuses.includes(status)) {
          throw new Error(`${opIndexStr} invalid status "${status}"`)
        }

        if (priority && !validPriorities.includes(priority)) {
          throw new Error(`${opIndexStr} invalid priority "${priority}"`)
        }

        if (!assignee_id || typeof assignee_id !== 'number') {
          throw new Error(`${opIndexStr} CREATE_TASK requires numeric assignee_id`)
        }

        const userExists = await User.find(assignee_id)
        if (!userExists) {
          throw new Error(`${opIndexStr} references non-existent assignee_id ${assignee_id}`)
        }
      } else if (op.action === 'UPDATE_TASK') {
        if (!op.task_id || typeof op.task_id !== 'number') {
          throw new Error(`${opIndexStr} UPDATE_TASK requires numeric task_id`)
        }

        const taskExists = await Task.find(op.task_id)
        if (!taskExists) {
          throw new Error(`${opIndexStr} references non-existent task_id ${op.task_id}`)
        }

        if (!op.data || typeof op.data !== 'object' || Object.keys(op.data).length === 0) {
          throw new Error(`${opIndexStr} UPDATE_TASK requires non-empty data object`)
        }

        const { project_id, status, priority, assignee_id } = op.data

        if (status && !validStatuses.includes(status)) {
          throw new Error(`${opIndexStr} invalid status "${status}"`)
        }

        if (priority && !validPriorities.includes(priority)) {
          throw new Error(`${opIndexStr} invalid priority "${priority}"`)
        }

        if (project_id) {
          const projectExists = await Project.find(project_id)
          if (!projectExists) {
            throw new Error(`${opIndexStr} references non-existent project_id ${project_id}`)
          }
        }

        if (assignee_id) {
          const userExists = await User.find(assignee_id)
          if (!userExists) {
            throw new Error(`${opIndexStr} references non-existent assignee_id ${assignee_id}`)
          }
        }
      } else if (op.action === 'DELETE_TASK') {
        if (!op.task_id || typeof op.task_id !== 'number') {
          throw new Error(`${opIndexStr} DELETE_TASK requires numeric task_id`)
        }

        const taskExists = await Task.find(op.task_id)
        if (!taskExists) {
          throw new Error(`${opIndexStr} references non-existent task_id ${op.task_id}`)
        }
      }
    }
  }

  /**
   * Executes all validated AI operations in a SINGLE database transaction.
   * If any step fails, transaction automatically rolls back.
   */
  public async executeAIOperationsInTransaction(operations: AIOperation[]): Promise<OperationResult[]> {
    return await db.transaction(async (trx) => {
      const results: OperationResult[] = []

      for (const op of operations) {
        if (op.action === 'CREATE_TASK') {
          const newTask = await Task.create(
            {
              projectId: op.data!.project_id!,
              title: op.data!.title!,
              description: op.data!.description || null,
              status: op.data!.status || 'todo',
              priority: op.data!.priority || 'medium',
              assigneeId: op.data!.assignee_id!,
            },
            { client: trx }
          )

          results.push({
            action: 'CREATE_TASK',
            task_id: newTask.id,
            details: newTask.toJSON(),
          })
        } else if (op.action === 'UPDATE_TASK') {
          const task = await Task.findOrFail(op.task_id!, { client: trx })
          task.useTransaction(trx)

          if (op.data!.title !== undefined) task.title = op.data!.title!
          if (op.data!.description !== undefined) task.description = op.data!.description
          if (op.data!.status !== undefined) task.status = op.data!.status!
          if (op.data!.priority !== undefined) task.priority = op.data!.priority!
          if (op.data!.project_id !== undefined) task.projectId = op.data!.project_id!
          if (op.data!.assignee_id !== undefined) task.assigneeId = op.data!.assignee_id!

          await task.save()

          results.push({
            action: 'UPDATE_TASK',
            task_id: task.id,
            details: task.toJSON(),
          })
        } else if (op.action === 'DELETE_TASK') {
          const task = await Task.findOrFail(op.task_id!, { client: trx })
          task.useTransaction(trx)
          await task.delete()

          results.push({
            action: 'DELETE_TASK',
            task_id: op.task_id!,
            details: { message: `Task ID ${op.task_id} deleted` },
          })
        }
      }

      return results
    })
  }
}
