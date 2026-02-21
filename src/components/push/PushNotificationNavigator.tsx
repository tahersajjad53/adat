import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Listens for push-notification-open (from pushNotifications.ts) and navigates to the right screen. */
export function PushNotificationNavigator({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: Event) => {
      const { goal_id, screen } = (e as CustomEvent<{ goal_id?: string; screen?: string }>).detail ?? {};
      if (screen === 'goals') {
        if (goal_id) {
          navigate('/goals', { state: { highlightGoalId: goal_id } });
        } else {
          navigate('/goals');
        }
      } else if (screen === 'namaz') {
        navigate('/namaz');
      }
    };
    window.addEventListener('push-notification-open', handler);
    return () => window.removeEventListener('push-notification-open', handler);
  }, [navigate]);

  return <>{children}</>;
}
