/**
 * Centralized Firebase error handling utility
 */

export interface FirebaseErrorMap {
    [code: string]: string;
}

const AUTH_ERROR_MESSAGES: FirebaseErrorMap = {
    'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/operation-not-allowed': 'Authentication is not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use a stronger password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
};

const FIRESTORE_ERROR_MESSAGES: FirebaseErrorMap = {
    'permission-denied': 'You do not have permission to perform this action.',
    'unavailable': 'Service temporarily unavailable. Please try again.',
    'failed-precondition': 'Operation requires additional setup. Please contact support.',
    'not-found': 'The requested resource was not found.',
};

export const getFirebaseErrorMessage = (error: any, context: string = ''): string => {
    if (!error || !error.code) {
        return context ? `${context}: An unknown error occurred` : 'An unknown error occurred';
    }

    const errorCode = error.code;

    // Check auth errors first
    if (AUTH_ERROR_MESSAGES[errorCode]) {
        return AUTH_ERROR_MESSAGES[errorCode];
    }

    // Check firestore errors
    if (FIRESTORE_ERROR_MESSAGES[errorCode]) {
        return FIRESTORE_ERROR_MESSAGES[errorCode];
    }

    // Fallback to error message if available
    if (error.message) {
        return context ? `${context}: ${error.message}` : error.message;
    }

    return context ? `${context}: Error code ${errorCode}` : `Error code ${errorCode}`;
};

export const logError = (context: string, error: any): void => {
    if (import.meta.env.DEV) {
        console.error(`[${context}]`, error);
    }
};
