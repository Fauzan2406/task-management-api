import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'

export default class TaskController {
  public async getProjectTasks({ params, response }: HttpContext) {
    const project = await Project.query().where('id', params.id).preload('tasks').first()

    if (!project) {
      return response.status(404).json({
        message: 'Project not found',
      })
    }

    const tasks = project.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignee_id: t.assigneeId,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
    }))

    return response.status(200).json({
      project: {
        id: project.id,
        name: project.name,
      },
      tasks,
    })
  }
}
