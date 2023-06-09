import type { APIContext } from 'astro'
import uap from 'ua-parser-js'
import { Md5 } from 'ts-md5'
import { insertEvent, TrackEvent } from '~/server/db'

interface Payload {
  v: string
  d: string
  r: string
  n: string
  u: string
  p: Record<string, string>
  s: string
  m: string
  tz: number
  tzp: string
  ps: string
  mi: string
  tag: string
  webglr: string
  webglv: string
}

export async function post(context: APIContext) {
  console.log('/api -> [start]')
  const payload = (await context.request.json()) as Payload
  const headers: Record<string, string> = {}
  for (const [key, value] of context.request.headers.entries()) {
    try {
      headers[key] = JSON.parse(value)
    } catch {
      headers[key] = value.replaceAll('"', '').replaceAll("'", '')
    }
  }
  const ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || context.clientAddress
  const ip_country = headers['cf-ipcountry'] || headers['x-country']
  const cf_ray = headers['cf-ray']
  const ua = uap(headers['user-agent'])
  // console.log(JSON.stringify(headers))
  // console.log('/api', JSON.stringify(payload))
  // console.log('ua:', ua)

  const [host, querystring] = payload.u.split('?')
  const qs: Record<string, string> = {}
  for (const [key, value] of new URLSearchParams(querystring).entries()) {
    qs[key] = value
  }
  let rhost = null
  let rquerystring = null
  const rqs: Record<string, string> = {}
  if (payload.r) {
    rhost = payload.r.split('?')[0].split('/')[2]
    rquerystring = payload.r.split('?')[1]
    for (const [key, value] of new URLSearchParams(rquerystring).entries()) {
      rqs[key] = value
    }
  }

  const event: TrackEvent = {
    referer: payload.r,
    referer_host: rhost,
    referer_querystring: JSON.stringify(rqs),
    origin: payload.d,
    event_name: payload.n,
    url: payload.u,
    url_host: host.split('/').filter(Boolean)[1],
    url_endpoint: `/${host.split('/').filter(Boolean).slice(2).join('/')}`,
    url_querystring: JSON.stringify(qs || {}),
    props: JSON.stringify(payload.p || {}),
    meta: payload.m,
    headers: JSON.stringify(headers || {}),
    timezone: payload.tzp,
    tz_offset: String(payload.tz),
    plugins: payload.ps,
    mimetypes: payload.mi,
    webgl_render: payload.webglr,
    webgl_vendor: payload.webglv,
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
    tag: new Md5().appendStr([
      headers['user-agent'],
      payload.tzp,
      payload.ps,
      payload.mi,
      payload.webglr,
      payload.webglv,
      payload.s,
    ].join('###')).end() as string,
  }
  await insertEvent(event)
  console.log('/api -> [done]')

  return new Response('created', {
    status: 200,
    statusText: 'created',
  })
}
