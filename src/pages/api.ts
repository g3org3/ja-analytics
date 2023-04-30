import type { APIContext } from 'astro';

export async function post (context: APIContext) {
  const payload = await context.request.json()
  console.log('/api', JSON.stringify(payload))

  return new Response('created', {
    status: 201,
    statusText: 'created',
  })
}
