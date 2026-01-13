import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/routes/index.jsx';
import { QueryClientProvider } from './app/providers/query-client.jsx';
import { ThemeProvider } from './app/providers/theme-provider.jsx';
import { SocketProvider } from './app/providers/socket-provider.jsx';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider>
      <ThemeProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
