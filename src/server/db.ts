import { connect } from '@planetscale/database'

const config = {
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
}

export async function getStats(domain: string) {
  const getViewSql = `
SELECT origin, count(event_name) AS pageviews
FROM events
WHERE event_name = 'pageview' AND origin = '${domain}'
GROUP BY origin;
`.trim()

  const viewsByPageSql = `
SELECT url_endpoint AS page, count(*) AS visitors
FROM events
WHERE event_name = 'pageview' AND origin = '${domain}'
GROUP BY url_endpoint
`

  const referesSql = `
SELECT COALESCE(referer, 'Direct / none') as referer, count(*) AS visitors
FROM events
WHERE event_name = 'pageview' AND origin = '${domain}'
GROUP BY origin, referer
`

  const ipCountrySql = `
SELECT COALESCE(ip_country, 'Direct / none') as country, count(*) AS visitors
FROM events
WHERE event_name = 'pageview' AND origin = '${domain}'
GROUP BY origin, ip_country
`

  const conn = connect(config)
  const pageviewsResult = await conn.execute(getViewSql)
  const viewsByPageResult = await conn.execute(viewsByPageSql)
  const refererResult = await conn.execute(referesSql)
  const ipCountryResult = await conn.execute(ipCountrySql)

  return {
    pageviews: pageviewsResult.rows.map((r) => (r as { pageviews: string }).pageviews).join(''),
    viewsByPage: viewsByPageResult.rows.map((r) => r as { page: string; visitors: string }),
    referers: refererResult.rows.map((r) => r as { referer: string; visitors: string }),
    ipCountries: ipCountryResult.rows.map((r) => r as { country: string; visitors: string }),
  }
}

export async function getDomains() {
  const sql = `
SELECT origin
FROM events
GROUP BY origin;
`
  const conn = connect(config)
  const result = await conn.execute(sql.trim())

  return result.rows.map((r) => (r as { origin: string }).origin)
}

export async function insertEvent(event: TrackEvent) {
  const values = Object.values(event).map((x) => (x == null ? 'null' : "'" + x + "'"))
  const sql = `
INSERT INTO events (${Object.keys(event).join(', ')}) 
VALUES (${values.join(', ')});
`
  // console.log(sql)
  const conn = connect(config)
  await conn.execute(sql.trim())
}

export interface TrackEvent {
  referer?: string | null
  referer_host?: string | null
  referer_querystring?: string | null
  origin: string
  event_name: string
  url: string
  url_host: string
  url_endpoint: string
  url_querystring: string
  props: string
  user_agent: string
  headers: string
  ip: string
  cf_ray?: string
  ip_country?: string
  screen: string
  browser_name?: string
  browser_version?: string
  engine_name?: string
  engine_version?: string
  os_name?: string
  os_version?: string
  device_vendor?: string
  device_model?: string
  device_type?: string
  cpu_arch?: string
}
