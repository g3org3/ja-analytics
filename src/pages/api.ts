import type { APIContext } from 'astro';
import { connect } from '@planetscale/database'
import uap from 'ua-parser-js'

export async function post (context: APIContext) {
  console.log('/api -> [start]')
  const payload = await context.request.json()
  const ip = context.clientAddress
  const headers: Record<string, string> = {}
  for (const [key, value] of context.request.headers.entries()) {
    headers[key] = value
  }
  const ua = uap(headers['user-agent'])
  // console.log('/api', JSON.stringify(payload))
  // console.log('ua:', ua)

  const config = {
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
  }
  const { d: origin, r: referer, n: event_name, u: url, p: props, s: screen } = payload
  const event = {
    referer,
    origin,
    event_name,
    url,
    props: JSON.stringify(props || {}),
    user_agent: headers['user-agent'],
    headers: JSON.stringify(headers || {}),
    ip,
    screen,
    browser_name: ua.browser.name,
    browser_version: ua.browser.version,
    engine_name: ua.engine.name,
    engine_version: ua.engine.version,
    os_name: ua.os.name,
    os_version: ua.os.version,
    device_vendor: ua.device.vendor,
    device_model: ua.device.model,
    device_type: ua.device.type,
    cpu_arch: ua.cpu.architecture,
  }
  const conn = connect(config)
  const sql = `
INSERT INTO events (${Object.keys(event).join(', ')}) 
VALUES (${Object.values(event).map(x => x == null ? 'NULL' : "'"+x+"'").join(', ')});
`
  // console.log(sql)
  await conn.execute(sql.trim())
  console.log('/api -> [done]')

  return new Response('created', {
    status: 201,
    statusText: 'created',
  })
}
