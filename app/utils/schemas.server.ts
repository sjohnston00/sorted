import { z } from 'zod'

export class URLSearchParamsSchemas {
  static friend = (value: unknown) =>
    z
      .object({
        friend: z.string().optional()
      })
      .parse(value)
}

export class MarkedHabitSchemas {
  static addMarkedHabit = (value: unknown) => {
    let valueToParse = value
    if (value instanceof FormData) {
      valueToParse = Object.fromEntries(value)
    }

    const schema = z.object({
      habitId: z.string(),
      date: z.string()
    })

    return schema.parse(valueToParse)
  }

  static removeMarkedHabit = (value: unknown) => {
    let valueToParse = value
    if (value instanceof FormData) {
      valueToParse = Object.fromEntries(value)
    }

    const schema = z.object({
      markedHabitId: z.string()
    })

    return schema.parse(valueToParse)
  }
}
