import type { HttpContext } from '@adonisjs/core/http'
import AIService from '#services/ai_service'
import TaskService from '#services/task_service'
import AuditLog from '#models/audit_log'
import { aiCommandValidator } from '#validators/ai_command_validator'

export default class AICommandController {
  private aiService = new AIService()
  private taskService = new TaskService()

  public async handle({ request, response, user }: HttpContext) {
    const payload = await aiCommandValidator.validate(request.all())
    const promptText = payload.prompt

    let aiResult: any = null

    try {
      // Step 1: Parse prompt via Gemini API
      aiResult = await this.aiService.parsePrompt(promptText)

      // Step 2: Check if AI returned explicit error payload (e.g. prompt attempted unauthorized action or was ambiguous)
      if (aiResult.error) {
        throw new Error(aiResult.error)
      }

      if (!aiResult.operations || !Array.isArray(aiResult.operations)) {
        throw new Error('AI returned an invalid instruction format')
      }

      // Step 3: Validate operations against backend rules and DB records
      await this.taskService.validateOperations(aiResult.operations)

      // Step 4: Execute all operations inside a single database transaction
      const executionResults = await this.taskService.executeAIOperationsInTransaction(aiResult.operations)

      const successResponse = {
        message: 'AI command executed successfully',
        operations: executionResults,
      }

      // Step 5: Save audit log record for successful execution
      await AuditLog.create({
        userId: user!.id,
        action: 'AI_COMMAND',
        requestPayload: JSON.stringify({ prompt: promptText }),
        responsePayload: JSON.stringify(successResponse),
        status: 'success',
        failedReason: null,
      })

      return response.status(200).json(successResponse)
    } catch (error: any) {
      const errorMessage = error.message || 'AI returned an invalid instruction format'
      const errorResponsePayload = {
        message: 'Invalid AI command response',
        error: errorMessage,
      }

      // Step 5: Save audit log record for failed execution
      try {
        await AuditLog.create({
          userId: user!.id,
          action: 'AI_COMMAND',
          requestPayload: JSON.stringify({ prompt: promptText }),
          responsePayload: JSON.stringify(errorResponsePayload),
          status: 'failed',
          failedReason: errorMessage,
        })
      } catch (auditErr) {
        console.error('Audit log save failure:', auditErr)
      }

      return response.status(400).json(errorResponsePayload)
    }
  }
}
