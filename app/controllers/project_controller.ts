import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import { createProjectValidator, updateProjectValidator } from '#validators/project_validator'

export default class ProjectController {
  public async store({ request, response, user }: HttpContext) {
    const payload = await createProjectValidator.validate(request.all())

    const project = await Project.create({
      name: payload.name,
      description: payload.description,
      createdBy: user!.id,
    })

    await project.load('creator')

    return response.status(201).json({
      message: 'Project created successfully',
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_by: project.createdBy,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      },
    })
  }

  public async index({ response }: HttpContext) {
    const projects = await Project.query().preload('creator')

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      created_by: p.createdBy,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      creator: {
        id: p.creator.id,
        name: p.creator.name,
        email: p.creator.email,
      },
    }))

    return response.status(200).json({
      message: 'Projects retrieved successfully',
      data: formattedProjects,
    })
  }

  public async show({ params, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: 'Project not found',
      })
    }

    await project.load('creator')

    return response.status(200).json({
      message: 'Project details retrieved successfully',
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_by: project.createdBy,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
        creator: {
          id: project.creator.id,
          name: project.creator.name,
          email: project.creator.email,
        },
      },
    })
  }

  public async update({ params, request, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: 'Project not found',
      })
    }

    const payload = await updateProjectValidator.validate(request.all())

    if (payload.name !== undefined) project.name = payload.name
    if (payload.description !== undefined) project.description = payload.description

    await project.save()

    return response.status(200).json({
      message: 'Project updated successfully',
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        created_by: project.createdBy,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      },
    })
  }

  public async destroy({ params, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: 'Project not found',
      })
    }

    await project.delete()

    return response.status(200).json({
      message: 'Project deleted successfully',
    })
  }
}
