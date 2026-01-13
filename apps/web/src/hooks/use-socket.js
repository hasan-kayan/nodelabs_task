import { useEffect } from 'react';
import { useSocket } from '../app/providers/socket-provider.jsx';

export function useSocketEvent(event, callback) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}
