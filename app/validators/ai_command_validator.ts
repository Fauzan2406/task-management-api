import vine from '@vinejs/vine'

export const aiCommandValidator = vine.compile(
  vine.object({
    prompt: vine.string().trim().minLength(3),
  })
)
