import type { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'
import hash from '@adonisjs/core/services/hash'
import env from '#start/env'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth_validator'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const payload = await registerValidator.validate(request.all())

    // Check email uniqueness explicitly for custom clean message
    const existingUser = await User.findBy('email', payload.email)
    if (existingUser) {
      return response.status(409).json({
        message: 'Email is already registered',
      })
    }

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || 'user',
    })

    return response.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }

  public async login({ request, response }: HttpContext) {
    const payload = await loginValidator.validate(request.all())

    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const isPasswordValid = await hash.verify(user.password, payload.password)
    if (!isPasswordValid) {
      return response.status(401).json({
        message: 'Invalid credentials',
      })
    }

    const secret = env.get('JWT_SECRET')
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: '7d' }
    )

    return response.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  }
}
