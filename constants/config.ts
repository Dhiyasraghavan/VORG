/**
 * Application configuration constants
 */

export const IMAGE_CONFIG = {
    EVENT_BANNER_MAX_WIDTH: 800,
    EVENT_BANNER_MAX_HEIGHT: 600,
    PROFILE_THUMBNAIL_SIZE: 300,
    COMPRESSION_QUALITY: 0.7,
    MAX_FILE_SIZE_MB: 10,
} as const;

export const VOLUNTEER_CONFIG = {
    ATTENDEES_PER_VOLUNTEER_RATIO: 50,
    MIN_QUIZ_SCORE: 0,
    MAX_QUIZ_SCORE: 100,
    PROFILE_IMAGES_REQUIRED: 3,
} as const;

export const FIRESTORE_LIMITS = {
    MAX_DOCUMENT_SIZE_BYTES: 1048576, // 1MB
    MAX_DOCUMENT_SIZE_KB: 1024,
} as const;

export const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false,
} as const;

export const APP_CONFIG = {
    DEFAULT_ORG_PASSWORD: 'TempOrgPass123', // Temporary fallback - should be removed
    DEFAULT_VOL_PASSWORD: 'TempVolPass123', // Temporary fallback - should be removed
} as const;
