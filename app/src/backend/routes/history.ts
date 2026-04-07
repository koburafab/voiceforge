import { Hono } from 'hono'
import { loadHistory, addHistoryEntry, clearHistory } from '../history'

export function createHistoryRoutes(): Hono {
  const app = new Hono()

  app.get('/history', (c) => {
    return c.json({ entries: loadHistory() })
  })

  app.post('/history', async (c) => {
    const body = await c.req.json()
    addHistoryEntry(body)
    return c.json({ ok: true })
  })

  app.delete('/history', (c) => {
    clearHistory()
    return c.json({ ok: true })
  })

  return app
}
