import type { APIContext } from 'astro'
import { insertAppError } from '~/server/db'

export async function post(context: APIContext) {
  const { message, origin, url } = (await context.request.json()) as {
    message: string
    origin: string
    url: string
  }
  const headers: Record<string, string> = {}
  for (const [key, value] of context.request.headers.entries()) {
    try {
      headers[key] = JSON.parse(value)
    } catch {
      headers[key] = value.replaceAll('"', '').replaceAll("'", '')
    }
  }
  const ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || context.clientAddress

  await insertAppError({ message, origin, url, ip, headers: JSON.stringify(headers) })

  return new Response('ok', {
    status: 201,
    statusText: 'created',
  })
}
