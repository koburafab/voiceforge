import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createTtsRoutes } from './routes/tts'
import { createSttRoutes } from './routes/stt'
import { createSettingsRoutes } from './routes/settings'
import { createHistoryRoutes } from './routes/history'

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:1420', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3002', 'tauri://localhost'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

app.get('/health', (c) => c.json({ ok: true }))

app.route('/api', createTtsRoutes())
app.route('/api', createSttRoutes())
app.route('/api', createSettingsRoutes())
app.route('/api', createHistoryRoutes())

console.log('VoiceForge backend listening on http://0.0.0.0:3002')

Bun.serve({
  hostname: '0.0.0.0',
  port: 3002,
  fetch: app.fetch,
})
