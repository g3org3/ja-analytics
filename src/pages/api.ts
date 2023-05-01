import type { APIContext } from 'astro';
import { connect } from '@planetscale/database'

export async function post (context: APIContext) {
  const payload = await context.request.json()
  console.log('/api', JSON.stringify(payload))
  console.log('ip', context.clientAddress)
  console.log('headers', JSON.stringify(context.request.headers))

  const config = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  }
  // {"n":"pageview","u":"https://host/","d":"origin","r":null}
  const { d: origin, r: referer, n: event_name, u: url } = payload
  const conn = connect(config)
  await conn.execute(`
INSERT INTO events (referer, origin, event_name, url, props) 
VALUES('${referer||"none"}', '${origin}', '${event_name}', '${url}', '{}');
`.trim())

  return new Response('created', {
    status: 201,
    statusText: 'created',
  })
}
