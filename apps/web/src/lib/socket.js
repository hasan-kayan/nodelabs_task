// Socket utilities
export function formatSocketEvent(event, data) {
  return { type: event, data, timestamp: new Date().toISOString() };
}
