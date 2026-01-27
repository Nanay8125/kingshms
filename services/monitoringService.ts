import * as Sentry from "@sentry/react";
import posthog from 'posthog-js';

// Configuration placeholders - in a real app these would be in .env
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || "";
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || "";
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com";

export const initMonitoring = () => {
    // Initialize Sentry
    if (SENTRY_DSN) {
        Sentry.init({
            dsn: SENTRY_DSN,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 1.0,
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            environment: import.meta.env.MODE,
        });
    }

    // Initialize PostHog
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: true,
            capture_pageview: true,
            persistence: 'localStorage',
        });
    }
};

/**
 * Log an error to Sentry and optionally PostHog
 */
export const logError = (error: Error, context?: Record<string, any>) => {
    console.error("Monitoring Log:", error, context);

    Sentry.withScope((scope) => {
        if (context) {
            scope.setExtras(context);
        }
        Sentry.captureException(error);
    });

    if (POSTHOG_KEY) {
        posthog.capture('error_occurred', {
            message: error.message,
            ...context
        });
    }
};

/**
 * Track a custom event in PostHog
 */
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    }
};

/**
 * Identify a user in monitoring services
 */
export const identifyUser = (userId: string, traits?: Record<string, any>) => {
    Sentry.setUser({ id: userId, ...traits });
    if (POSTHOG_KEY) {
        posthog.identify(userId, traits);
    }
};

/**
 * Clear user identification (e.g. on logout)
 */
export const clearUserIdentity = () => {
    Sentry.setUser(null);
    if (POSTHOG_KEY) {
        posthog.reset();
    }
};
