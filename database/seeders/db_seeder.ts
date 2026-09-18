import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Project from '#models/project'
import Task from '#models/task'

export default class extends BaseSeeder {
  async run() {
    // 1. Seed Users
    const admin = await User.firstOrCreate(
      { email: 'admin@example.com' },
      {
        name: 'Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      }
    )

    const user1 = await User.firstOrCreate(
      { email: 'user1@example.com' },
      {
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123',
        role: 'user',
      }
    )

    const user2 = await User.firstOrCreate(
      { email: 'user2@example.com' },
      {
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123',
        role: 'user',
      }
    )

    const user3 = await User.firstOrCreate(
      { email: 'user3@example.com' },
      {
        name: 'User Three',
        email: 'user3@example.com',
        password: 'password123',
        role: 'user',
      }
    )

    // 2. Seed Projects
    const project1 = await Project.firstOrCreate(
      { name: 'Website Development' },
      {
        name: 'Website Development',
        description: 'Development of corporate website and backend REST API',
        createdBy: admin.id,
      }
    )

    const project2 = await Project.firstOrCreate(
      { name: 'Mobile Application' },
      {
        name: 'Mobile Application',
        description: 'Cross-platform mobile application development for iOS and Android',
        createdBy: admin.id,
      }
    )

    // 3. Seed Tasks
    await Task.firstOrCreate(
      { title: 'Setup Authentication System', projectId: project1.id },
      {
        projectId: project1.id,
        title: 'Setup Authentication System',
        description: 'Implement JWT authentication and RBAC middleware',
        status: 'done',
        priority: 'high',
        assigneeId: user1.id,
      }
    )

    await Task.firstOrCreate(
      { title: 'Design Database Schema', projectId: project1.id },
      {
        projectId: project1.id,
        title: 'Design Database Schema',
        description: 'Create migrations for users, projects, tasks, and audit logs',
        status: 'done',
        priority: 'high',
        assigneeId: user2.id,
      }
    )

    await Task.firstOrCreate(
      { title: 'Fix Login Bug', projectId: project1.id },
      {
        projectId: project1.id,
        title: 'Fix Login Bug',
        description: 'Fix authentication issue when submitting invalid credentials',
        status: 'todo',
        priority: 'high',
        assigneeId: user3.id,
      }
    )

    await Task.firstOrCreate(
      { title: 'Integrate Gemini AI Command', projectId: project1.id },
      {
        projectId: project1.id,
        title: 'Integrate Gemini AI Command',
        description: 'Implement natural language to JSON command translator',
        status: 'in_progress',
        priority: 'high',
        assigneeId: user1.id,
      }
    )

    await Task.firstOrCreate(
      { title: 'Implement Task ID 5 Feature', projectId: project1.id },
      {
        projectId: project1.id,
        title: 'Implement Task ID 5 Feature',
        description: 'Task number 5 for testing update AI command scenarios',
        status: 'todo',
        priority: 'medium',
        assigneeId: user2.id,
      }
    )

    await Task.firstOrCreate(
      { title: 'Setup CI/CD Pipeline', projectId: project2.id },
      {
        projectId: project2.id,
        title: 'Setup CI/CD Pipeline',
        description: 'Automate build and deployment pipeline for staging environment',
        status: 'todo',
        priority: 'medium',
        assigneeId: user3.id,
      }
    )
  }
}
