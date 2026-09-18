import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProjectController = () => import('#controllers/project_controller')
const TaskController = () => import('#controllers/task_controller')
const AICommandController = () => import('#controllers/ai_command_controller')

// Public routes
router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])

// Authenticated routes group
router
  .group(() => {
    // Admin only project creation, modification, deletion
    router.post('/projects', [ProjectController, 'store']).use(middleware.role({ roles: ['admin'] }))
    router.put('/projects/:id', [ProjectController, 'update']).use(middleware.role({ roles: ['admin'] }))
    router.delete('/projects/:id', [ProjectController, 'destroy']).use(middleware.role({ roles: ['admin'] }))

    // All authenticated users can view projects
    router.get('/projects', [ProjectController, 'index'])
    router.get('/projects/:id', [ProjectController, 'show'])

    // All authenticated users can view project tasks
    router.get('/projects/:id/tasks', [TaskController, 'getProjectTasks'])

    // All authenticated users can execute AI command
    router.post('/ai/command', [AICommandController, 'handle'])
  })
  .use(middleware.auth())
