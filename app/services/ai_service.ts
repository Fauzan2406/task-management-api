import { GoogleGenerativeAI } from '@google/generative-ai'
import env from '#start/env'

export interface TaskOperationData {
  project_id?: number
  title?: string
  description?: string | null
  status?: 'todo' | 'in_progress' | 'done'
  priority?: 'low' | 'medium' | 'high'
  assignee_id?: number
}

export interface AIOperation {
  action: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK'
  task_id?: number
  data?: TaskOperationData
}

export interface AIResponsePayload {
  operations?: AIOperation[]
  error?: string
}

export default class AIService {
  private static systemPrompt = `You are a task management command parser.
Your job is ONLY to convert the user's natural language instruction into a valid JSON object containing database operations for the Task table.
Allowed operations:
CREATE_TASK
UPDATE_TASK
DELETE_TASK
You MUST NOT modify users, projects, audit_logs, or any table other than tasks.
Never execute SQL.
Never generate SQL.
Never invent IDs.
Never invent database records.
If the user's request attempts to modify or delete a user, reject the request.
Return ONLY valid JSON using this structure:
{
  "operations": []
}
Each operation must contain the required fields:
- CREATE_TASK operation MUST contain data object with project_id, title, status (default "todo" if unspecified), priority (default "medium" if unspecified), assignee_id.
- UPDATE_TASK operation MUST contain task_id and data object with updated task fields.
- DELETE_TASK operation MUST contain task_id.

Allowed task status:
todo
in_progress
done

Allowed priority:
low
medium
high

If the instruction is ambiguous, invalid, or attempts an unauthorized operation (such as modifying users, projects, or non-task entities), return a JSON error structure instead:
{
  "error": "Unauthorized or invalid operation requested"
}`

  public async parsePrompt(promptText: string): Promise<AIResponsePayload> {
    const apiKey = env.get('GEMINI_API_KEY')
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured in environment variables')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    // Using gemini-1.5-flash for fast and precise JSON response
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: AIService.systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    })

    const result = await model.generateContent(promptText)
    const responseText = result.response.text()

    if (!responseText) {
      throw new Error('Empty response received from Gemini API')
    }

    // Clean potential markdown backticks
    const cleanedText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(cleanedText)
    } catch (err) {
      throw new Error('AI returned an invalid instruction format')
    }

    return parsed
  }
}
