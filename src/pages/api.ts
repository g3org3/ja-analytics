import type { APIContext } from 'astro'
import uap from 'ua-parser-js'
import { insertEvent, TrackEvent } from '~/server/db'

interface Payload {
  d: string
  r: string
  n: string
  u: string
  p: Record<string, string>
  s: string
}
export async function post(context: APIContext) {
  console.log('/api -> [start]')
  const payload = (await context.request.json()) as Payload
  const headers: Record<string, string> = {}
  for (const [key, value] of context.request.headers.entries()) {
    headers[key] = value
  }
  const ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || context.clientAddress
  const ip_country = headers['cf-ipcountry'] || headers['x-country']
  const cf_ray = headers['cf-ray']
  const ua = uap(headers['user-agent'])
  // console.log('/api', JSON.stringify(payload))
  // console.log('ua:', ua)

  const [host, querystring] = payload.u.split('?')
  const qs: Record<string, string> = {}
  for (const [key, value] of new URLSearchParams(querystring).entries()) {
    qs[key] = value
  }
  const event: TrackEvent = {
    referer: payload.r,
    origin: payload.d,
    event_name: payload.n,
    url: payload.u,
    url_host: host.split('/').filter(Boolean)[1],
    url_endpoint: `/${host.split('/').filter(Boolean).slice(2).join('/')}`,
    url_querystring: JSON.stringify(qs || {}),
    props: JSON.stringify(payload.p || {}),
    user_agent: headers['user-agent'],
    headers: JSON.stringify(headers || {}),
    ip,
    cf_ray,
    ip_country,
    screen: payload.s,
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
  await insertEvent(event)
  console.log('/api -> [done]')

  return new Response('created', {
    status: 201,
    statusText: 'created',
  })
}
