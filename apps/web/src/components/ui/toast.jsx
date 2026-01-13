import { useEffect } from 'react';
import { useUIStore } from '../../store/ui.store.js';
import { cn } from '../../lib/cn.js';

export function Toast({ id, message, type = 'info', duration = 3000 }) {
  const removeNotification = useUIStore((state) => state.removeNotification);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, removeNotification]);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg',
        {
          'bg-background': type === 'info',
          'bg-destructive text-destructive-foreground': type === 'error',
          'bg-green-500 text-white': type === 'success',
        }
      )}
    >
      {message}
    </div>
  );
}

export function ToastContainer() {
  const notifications = useUIStore((state) => state.notifications);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Toast key={notification.id} {...notification} />
      ))}
    </div>
  );
}
