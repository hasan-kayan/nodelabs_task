import http from 'http';
import app from '../app.js';

export function createServer() {
  const server = http.createServer(app);
  return { app, server };
}
