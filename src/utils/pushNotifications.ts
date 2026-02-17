import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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
      // TODO: Send this token to your backend server
      // saveTokenToServer(token.value);
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

    // Method called when tapping on a notification
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push notification action performed', notification);
        // Navigate to specific screen based on notification data
        // Example: router.push('/notifications');
      }
    );
  }
};
