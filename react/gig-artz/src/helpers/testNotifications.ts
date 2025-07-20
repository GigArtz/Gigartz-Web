import { notify } from '../helpers/notify';

/**
 * Test utility for demonstrating global notifications
 * This can be called from any component to test the notification system
 */
export const testGlobalNotifications = () => {
    console.log('🔔 Testing global notifications...');

    // Test different notification types with delays to see them in sequence
    setTimeout(() => {
        notify('Welcome! Your profile has been updated successfully.', 'success');
    }, 500);

    setTimeout(() => {
        notify('New message received from John Doe', 'info');
    }, 1500);

    setTimeout(() => {
        notify('Event booking requires your attention', 'warning');
    }, 2500);

    setTimeout(() => {
        notify('Failed to sync data. Please check your connection.', 'error');
    }, 3500);
};

/**
 * Test specific notification types individually
 */
export const testNotificationType = (type: 'success' | 'error' | 'info' | 'warning') => {
    const messages = {
        success: 'Operation completed successfully!',
        error: 'Something went wrong. Please try again.',
        info: 'Here\'s some helpful information for you.',
        warning: 'Please review this important notice.'
    };

    notify(messages[type], type);
};

/**
 * Test notification persistence (these will appear in the notifications page)
 */
export const testPersistentNotifications = () => {
    console.log('💾 Testing persistent notifications...');

    const notifications = [
        { message: 'Your event "Jazz Night" has been approved', type: 'success' as const },
        { message: 'New follower: Sarah Johnson started following you', type: 'info' as const },
        { message: 'Event reminder: "Rock Concert" starts in 2 hours', type: 'warning' as const },
        { message: 'Payment failed for ticket booking', type: 'error' as const }
    ];

    notifications.forEach((notif, index) => {
        setTimeout(() => {
            notify(notif.message, notif.type);
        }, index * 800);
    });
};
