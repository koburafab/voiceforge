import { Hono } from 'hono'
import { loadSettings, saveSettings } from '../settings'

export function createSettingsRoutes(): Hono {
  const app = new Hono()

  app.get('/settings', (c) => {
    const s = loadSettings()
    return c.json(s)
  })

  app.put('/settings', async (c) => {
    const body = await c.req.json()
    saveSettings(body)
    return c.json({ ok: true })
  })

  return app
}
