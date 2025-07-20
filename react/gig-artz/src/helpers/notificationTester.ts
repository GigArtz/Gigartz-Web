import { AppDispatch } from "../../store/store";
import { notify } from "./notify";

/**
 * Utility function to test notifications across different types
 * This can be used for testing or demonstration purposes
 */
export const testNotifications = (dispatch: AppDispatch) => {
    console.log("Testing all notification types...");

    // Test login notification
    notify(dispatch, {
        type: "login",
        data: {
            username: "TestUser",
            date: new Date().toISOString()
        }
    });

    // Test follower notification
    setTimeout(() => {
        notify(dispatch, {
            type: "follower",
            data: {
                username: "JohnDoe"
            }
        });
    }, 1000);

    // Test event notification
    setTimeout(() => {
        notify(dispatch, {
            type: "event",
            data: {
                message: "Your event has been created successfully!",
                type: "success"
            }
        });
    }, 2000);

    // Test review notification
    setTimeout(() => {
        notify(dispatch, {
            type: "review",
            data: {
                message: "New review received on your event!",
                type: "info"
            }
        });
    }, 3000);

    // Test guestlist notification
    setTimeout(() => {
        notify(dispatch, {
            type: "guestlist",
            data: {
                message: "Someone joined your event guest list!",
                type: "success"
            }
        });
    }, 4000);

    // Test ticket notification
    setTimeout(() => {
        notify(dispatch, {
            type: "ticket",
            data: {
                event: "Rock Concert 2025"
            }
        });
    }, 5000);

    // Test booking notification
    setTimeout(() => {
        notify(dispatch, {
            type: "booking",
            data: {
                service: "Guitar Lessons",
                date: "July 25, 2025"
            }
        });
    }, 6000);

    // Test tip notification
    setTimeout(() => {
        notify(dispatch, {
            type: "tip",
            data: {
                username: "Alice",
                amount: "25"
            }
        });
    }, 7000);

    // Test general notification
    setTimeout(() => {
        notify(dispatch, {
            type: "general",
            data: {
                message: "This is a general notification test!",
                type: "info"
            }
        });
    }, 8000);

    console.log("All test notifications scheduled!");
};

/**
 * Test specific notification types
 */
export const testSpecificNotification = (dispatch: AppDispatch, type: string, data: Record<string, unknown>) => {
    notify(dispatch, { type, data });
};

/**
 * Create notifications for major app events
 */
export const createEventNotifications = {
    // Auth events
    userRegistered: (dispatch: AppDispatch, username: string) => {
        notify(dispatch, {
            type: "general",
            data: {
                message: `Welcome to GigArtz, ${username}! 🎉`,
                type: "success"
            }
        });
    },

    userLoggedIn: (dispatch: AppDispatch, username: string) => {
        notify(dispatch, {
            type: "login",
            data: {
                username,
                date: new Date().toISOString()
            }
        });
    },

    userLoggedOut: (dispatch: AppDispatch) => {
        notify(dispatch, {
            type: "general",
            data: {
                message: "You have been logged out successfully.",
                type: "info"
            }
        });
    },

    // Event events
    eventCreated: (dispatch: AppDispatch, eventName: string) => {
        notify(dispatch, {
            type: "event",
            data: {
                message: `Event "${eventName}" has been created successfully!`,
                type: "success"
            }
        });
    },

    eventUpdated: (dispatch: AppDispatch, eventName: string) => {
        notify(dispatch, {
            type: "event",
            data: {
                message: `Event "${eventName}" has been updated successfully!`,
                type: "success"
            }
        });
    },

    // Profile events
    profileUpdated: (dispatch: AppDispatch) => {
        notify(dispatch, {
            type: "general",
            data: {
                message: "Your profile has been updated successfully!",
                type: "success"
            }
        });
    },

    newFollower: (dispatch: AppDispatch, followerName: string) => {
        notify(dispatch, {
            type: "follower",
            data: {
                username: followerName
            }
        });
    },

    // Message events
    messageSent: (dispatch: AppDispatch) => {
        notify(dispatch, {
            type: "general",
            data: {
                message: "Message sent successfully!",
                type: "success"
            }
        });
    },

    messageReceived: (dispatch: AppDispatch, senderName: string) => {
        notify(dispatch, {
            type: "general",
            data: {
                message: `New message from ${senderName}`,
                type: "info"
            }
        });
    }
};
