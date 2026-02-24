/**
 * Environment configuration validation
 */

const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
] as const;

export const validateEnvironment = (): void => {
    const missing = requiredEnvVars.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        const errorMessage =
            `❌ Missing required environment variables:\n` +
            missing.map(v => `  - ${v}`).join('\n') +
            `\n\n📝 Please check your .env.local file and ensure all Firebase credentials are set.\n` +
            `See firebase_setup.md for instructions.`;

        console.error(errorMessage);
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
};

export const getEnvVar = (key: string, fallback?: string): string => {
    const value = import.meta.env[key];
    if (!value && !fallback) {
        console.warn(`Environment variable ${key} is not set`);
    }
    return value || fallback || '';
};
