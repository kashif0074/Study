export const PRIMARY = {
    // Purple / Violet Palette
    background: '#FAF5FF',        // Main App Background
    surface: '#F3E8FF',           // Selected option background
    borderLight: '#E9D5FF',        // Lighter borders / accents
    borderActive: '#C4B5FD',       // Selected option border / secondary interactive
    light: '#A855F7',              // Lighter purple
    main: '#6B21A8',               // MAIN BRAND COLOR
    primary: '#8B5CF6',            // Standard purple
    vibrant: '#7C3AED',            // Vibrant purple
    dark: '#581C87',               // Darker purple
    textDark: '#1E1B4B',            // Dark text
};

export const SECONDARY = {
    // Green (Success / Correct / Voice / XP)
    background: '#ECFDF5',
    surface: '#D1FAE5',
    border: '#A7F3D0',
    light: '#6EE7B7',
    accent: '#34D399',
    main: '#10B981',               // Standard Green
    dark: '#059669',               // Darker Green
    darker: '#047857',
};

export const ACCENT_RED = {
    // Red (PDF / Wrong / Error)
    background: '#FEF2F2',
    surface: '#FEE2E2',
    light: '#F87171',
    main: '#EF4444',               // Standard Red
    dark: '#DC2626',               // Darker Red
    darker: '#B91C1C',
};

export const ACCENT_BLUE = {
    // Blue (Image / Info)
    main: '#2563EB',
    dark: '#1D4ED8',
};

export const ACCENT_YELLOW = {
    // Yellow / Gold (Results / Trophy / XP)
    background: '#FEF3C7',
    light: '#FBBF24',
    main: '#F59E0B',
    dark: '#B45309',
};

export const NEUTRAL = {
    background: '#F8FAFC',    // Inputs / Borders Light
    surface: '#F1F5F9',
    border: '#E2E8F0',   // Inputs / Borders Medium
    disabled: '#CBD5E1',   // Disabled button
    placeholder: '#9CA3AF',   // Placeholder
    textGray: '#6B7280',   // Gray text
    textMedium: '#4B5563',
    textDark: '#374151',   // Gray text dark
    textExtraDark: '#1E293B',   // Dark text
    black: '#0F172A',   // Very dark
};

export const SUBJECTS = {
    mathematics: PRIMARY.main,
    physics: ACCENT_BLUE.main,
    chemistry: SECONDARY.main,
    biology: SECONDARY.dark,
    computer: '#4F46E5',         // Indigo
    language: '#DB2777',         // Pink
    history: ACCENT_YELLOW.main,
    geography: '#EA580C',        // Orange
    art: '#D946EF',              // Fuchsia
    business: '#0D9488',         // Teal
    psychology: PRIMARY.vibrant,
    engineering: '#2563EB',
};

export const STATUS = {
    success: SECONDARY.main,     // #10B981
    warning: ACCENT_YELLOW.light, // #FBBF24
    error: ACCENT_RED.main,      // #EF4444
    info: ACCENT_BLUE.main,      // #2563EB
    progress: PRIMARY.primary,      // #8B5CF6
    correct: SECONDARY.dark,     // #059669
    wrong: ACCENT_RED.dark,      // #DC2626
};

export const UI = {
    gradientPrimary: [PRIMARY.main, PRIMARY.vibrant, PRIMARY.primary],
    gradientSuccess: [SECONDARY.dark, SECONDARY.main, SECONDARY.accent],
    gradientWarning: [ACCENT_YELLOW.dark, ACCENT_YELLOW.main, ACCENT_YELLOW.light],

    shadowLight: 'rgba(107, 33, 168, 0.08)', // based on #6B21A8
    shadowMedium: 'rgba(107, 33, 168, 0.15)',
    shadowDark: 'rgba(107, 33, 168, 0.25)',

    overlayLight: 'rgba(255, 255, 255, 0.9)',
    overlayDark: 'rgba(30, 27, 75, 0.6)', // based on #1E1B4B
};

export const StudyPlannerTheme = {
    header: PRIMARY.main,
    headerText: '#FFFFFF',
    addButton: PRIMARY.main,
    examCard: {
        normal: '#FFFFFF',
        urgent: ACCENT_RED.background,
        highPriority: ACCENT_YELLOW.background,
    },
    sessionComplete: SECONDARY.surface,
    sessionPending: PRIMARY.surface,
    timeline: PRIMARY.borderActive,
};

export const NotesTheme = {
    header: PRIMARY.main,
    noteCard: {
        text: PRIMARY.background,
        pdf: ACCENT_RED.background,
        image: '#EFF6FF', // Blue 50
        voice: SECONDARY.background,
    },
    searchBar: NEUTRAL.border, // #E2E8F0
    fab: PRIMARY.main,
    filterActive: PRIMARY.main,
    filterInactive: NEUTRAL.placeholder,
};

export const Buttons = {
    primary: {
        background: PRIMARY.main,  // #6B21A8
        text: '#FFFFFF',
        hover: PRIMARY.dark,
    },
    secondary: {
        background: PRIMARY.surface,  // #F3E8FF
        text: PRIMARY.main,
        hover: PRIMARY.borderLight,
    },
    success: {
        background: SECONDARY.main,
        text: '#FFFFFF',
        hover: SECONDARY.dark,
    },
    disabled: {
        background: NEUTRAL.disabled, // #CBD5E1
        text: NEUTRAL.textGray,
    },
    outline: {
        background: 'transparent',
        border: PRIMARY.borderActive,      // #C4B5FD
        text: PRIMARY.main,
    },
};

export const Typography = {
    h1: {
        color: PRIMARY.textDark, // #1E1B4B
        size: 28,
        weight: '800',
    },
    h2: {
        color: NEUTRAL.textExtraDark, // #1E293B
        size: 24,
        weight: '700',
    },
    h3: {
        color: NEUTRAL.textDark, // #374151
        size: 20,
        weight: '600',
    },
    body: {
        color: NEUTRAL.textDark, // #374151 (Gray text) - or NEUTRAL[500] (#6B7280) based on pref
        size: 16,
        weight: '400',
    },
    caption: {
        color: NEUTRAL.placeholder, // #9CA3AF
        size: 14,
        weight: '400',
    },
};

// --- Backward Compatibility / Global Theme ---

export const lightTheme = {
    background: PRIMARY.background,   // #FAF5FF (Main App Background)
    card: '#FFFFFF',           // Cards
    text: PRIMARY.textDark,        // #1E1B4B (Dark text)
    subText: NEUTRAL.textGray,     // #6B7280 (Gray text)
    border: NEUTRAL.border,      // #E2E8F0 (Inputs / Borders)
    primary: PRIMARY.main,     // #6B21A8 (Main brand color)
    secondary: PRIMARY.borderActive,   // #C4B5FD (Selected option border / secondary)
    accent: PRIMARY.surface,      // #F3E8FF (Selected option)

    // Semantic
    danger: STATUS.error,      // #EF4444
    dangerDark: ACCENT_RED.dark,
    success: STATUS.success,   // #10B981
    warning: STATUS.warning,   // #FBBF24
    warningLight: ACCENT_YELLOW.background,
    info: STATUS.info,         // #2563EB

    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Category Colors
    catMath: SUBJECTS.mathematics,
    catPhysics: SUBJECTS.physics,
    catChem: SUBJECTS.chemistry,
    catBio: SUBJECTS.biology,
    catCS: SUBJECTS.computer,

    // UI Elements
    inputBackground: NEUTRAL.background, // #F8FAFC
    placeholder: NEUTRAL.placeholder,    // #9CA3AF
    divider: NEUTRAL.border,        // #E2E8F0
    overlay: UI.overlayLight,
    disabled: NEUTRAL.disabled,

    badges: {
        note: PRIMARY.surface,         // #F3E8FF
        question: ACCENT_YELLOW.background, // #FEF3C7
        challenge: ACCENT_RED.background,    // #FEF2F2
    }
};

export const darkTheme = {
    background: NEUTRAL.black,     // #0F172A
    card: NEUTRAL.textExtraDark,           // #1E293B
    text: '#F8FAFC',              // Light text
    subText: NEUTRAL.placeholder,        // #9CA3AF
    border: NEUTRAL.textDark,         // #374151
    primary: PRIMARY.vibrant,        // #7C3AED (Lighter for dark mode)
    secondary: PRIMARY.primary,      // #8B5CF6
    accent: NEUTRAL.textDark,

    // Semantic
    danger: STATUS.error,
    dangerDark: '#991B1B',
    success: STATUS.success,
    warning: STATUS.warning,
    warningLight: '#D97706',
    info: STATUS.info,

    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Category Colors
    catMath: SUBJECTS.mathematics,
    catPhysics: SUBJECTS.physics,
    catChem: SUBJECTS.chemistry,
    catBio: SUBJECTS.biology,
    catCS: SUBJECTS.computer,

    // UI Elements
    inputBackground: NEUTRAL.textExtraDark,
    placeholder: NEUTRAL.textGray,
    divider: NEUTRAL.textDark,
    overlay: UI.overlayDark,
    disabled: NEUTRAL.textDark,

    badges: {
        note: PRIMARY.dark,
        question: STATUS.warning + '40',
        challenge: STATUS.error + '40',
    }
};

export default {
    lightTheme,
    darkTheme,
    PRIMARY,
    SECONDARY,
    NEUTRAL,
    ACCENT_RED,
    ACCENT_BLUE,
    ACCENT_YELLOW,
    SUBJECTS,
    STATUS,
    UI,
    StudyPlannerTheme,
    NotesTheme,
    Buttons,
    Typography
};