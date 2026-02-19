import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const saveTokenToServer = async (token: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user, skipping push token save');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save push token:', error);
      return;
    }
    console.log('Push token saved to server');
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

export const initPushNotifications = async () => {
  // Only run on native platforms
  if (Capacitor.getPlatform() !== 'web') {
    // Request permission to use push notifications
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // On success, we should get a token
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      saveTokenToServer(token.value);
    });

    // Some issue with registration
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push notification received: ', notification);
        // You can show an in-app alert or update UI here
      }
    );

    // Method called when tapping on a notification — dispatch for app to handle navigation
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        const data = notification.notification?.data ?? notification.notification ?? {};
        const goalId = typeof data.goal_id === 'string' ? data.goal_id : undefined;
        const screen = typeof data.screen === 'string' ? data.screen : 'goals';
        window.dispatchEvent(
          new CustomEvent('push-notification-open', { detail: { goal_id: goalId, screen } })
        );
      }
    );
  }
};
