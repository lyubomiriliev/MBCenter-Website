import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const show = useCallback((type: NotificationType, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setNotifications(prev => [...prev, { id, type, message }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showError = useCallback((message: string) => show('error', message), [show]);
  const showSuccess = useCallback((message: string) => show('success', message), [show]);
  const showInfo = useCallback((message: string) => show('info', message), [show]);

  return {
    notifications,
    show,
    dismiss,
    showError,
    showSuccess,
    showInfo,
  };
}
