export default defineEventHandler(() => ({
  code: 0,
  message: 'ok',
  data: {
    status: 'ok',
    timestamp: new Date().toISOString()
  }
}))
