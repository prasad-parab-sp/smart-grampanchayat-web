/**
 * Centralized Icon System for Smart Grampanchayat
 * All emojis used throughout the application
 * 
 * Note: Each emoji is used only once to avoid confusion
 */

export const ICONS = {
  // Authentication & User
  LOGIN: '🏛️',
  USER: '👤',
  ADMIN: '👨‍💼',
  CITIZEN: '👥',
  SECURITY: '🔐',
  LOGOUT: '🚪',

  // Navigation
  HOME: '🏠',
  DASHBOARD: '📊',
  MENU: '☰',
  BACK: '⬅️',
  FORWARD: '➡️',
  SETTINGS: '⚙️',
  INFO: 'ℹ️',

  // Government Services & Certificates
  SERVICES: '📋',
  CERTIFICATE: '📄',
  PROPERTY: '🏘️',           // Changed from 🏠 to avoid duplicate with HOME
  TAX_PAYMENT: '💰',
  ELECTRICITY: '💡',
  WATER: '💧',
  WASTE_MANAGEMENT: '🚮',
  BIRTH_CERTIFICATE: '👶',
  DEATH_CERTIFICATE: '⚰️',
  MARRIAGE_CERTIFICATE: '💒',
  INCOME_CERTIFICATE: '💼',
  CASTE_CERTIFICATE: '📜',
  DOMICILE_CERTIFICATE: '🏪',  // Changed from 🏘️ to avoid duplicate with PROPERTY

  // Contact & Communication
  CONTACT: '📞',
  EMAIL: '✉️',
  PHONE: '📱',
  ADDRESS: '📍',
  HELPLINE: '🆘',
  NOTIFICATION: '🔔',
  MESSAGE: '💬',

  // Status Indicators
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  PENDING: '⏳',
  IN_PROGRESS: '🔄',
  APPROVED: '☑️',           // Changed from ✅ to avoid duplicate with SUCCESS
  REJECTED: '🚫',           // Changed from ❌ to avoid duplicate with ERROR
  COMPLETED: '✔️',
  CANCELLED: '🛑',          // Changed from 🚫 to avoid duplicate with REJECTED

  // Documents & Files
  DOCUMENT: '📃',           // Changed from 📄 to avoid duplicate with CERTIFICATE
  UPLOAD: '📤',
  DOWNLOAD: '📥',
  PDF: '📋',
  IMAGE: '🖼️',
  FILE: '📁',
  ATTACHMENT: '📎',

  // Financial
  PAYMENT: '💳',
  MONEY: '💵',              // Changed from 💰 to avoid duplicate with TAX_PAYMENT
  BANK: '🏦',
  RECEIPT: '🧾',
  BILL: '💸',
  REFUND: '💴',             // Changed from 💵 to avoid duplicate with MONEY

  // Actions
  EDIT: '✏️',
  DELETE: '🗑️',
  SAVE: '💾',
  PRINT: '🖨️',
  SEARCH: '🔍',
  FILTER: '🔽',
  SORT: '🔀',
  REFRESH: '🔃',            // Changed from 🔄 to avoid duplicate with IN_PROGRESS
  ADD: '➕',
  REMOVE: '➖',

  // Visibility
  SHOW: '👁️',
  HIDE: '🙈',
  VISIBLE: '👀',
  INVISIBLE: '🫥',

  // Time & Date
  CALENDAR: '📅',
  CLOCK: '🕐',
  DATE: '📆',
  TIME: '⏰',
  SCHEDULE: '🗓️',

  // Location & Places
  VILLAGE: '🏞️',           // Changed from 🏘️ to avoid duplicate with PROPERTY
  OFFICE: '🏢',
  HOSPITAL: '🏥',
  SCHOOL: '🏫',
  POLICE: '👮‍♂️',
  COURT: '⚖️',

  // Utilities
  POWER: '⚡',
  WATER_DROP: '🌊',         // Changed from 💧 to avoid duplicate with WATER
  INTERNET: '🌐',
  WIFI: '📶',
  SIGNAL: '📡',

  // Transportation
  VEHICLE: '🚗',
  LICENSE: '🪪',
  PARKING: '🅿️',
  ROAD: '🛣️',

  // Emergency
  EMERGENCY: '🚨',
  FIRE: '🔥',
  AMBULANCE: '🚑',
  POLICE_CAR: '🚓',

  // Weather & Environment
  WEATHER: '🌤️',
  RAIN: '🌧️',
  SUN: '☀️',
  TREE: '🌳',
  ENVIRONMENT: '🌍',

  // Special
  STAR: '⭐',
  HEART: '❤️',
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  CLAP: '👏',
  CELEBRATE: '🎉'
} as const;

// Type for icon keys
export type IconKey = keyof typeof ICONS;

// Helper function to get icon
export function getIcon(key: IconKey): string {
  return ICONS[key];
}

// Commonly used icon groups for easy access
export const ICON_GROUPS = {
  STATUS: {
    SUCCESS: ICONS.SUCCESS,        // ✅
    ERROR: ICONS.ERROR,            // ❌
    WARNING: ICONS.WARNING,        // ⚠️
    PENDING: ICONS.PENDING,        // ⏳
    IN_PROGRESS: ICONS.IN_PROGRESS,// 🔄
    APPROVED: ICONS.APPROVED,      // ☑️
    REJECTED: ICONS.REJECTED,      // 🚫
    COMPLETED: ICONS.COMPLETED,    // ✔️
    CANCELLED: ICONS.CANCELLED     // 🛑
  },
  
  SERVICES: {
    CERTIFICATE: ICONS.CERTIFICATE,     // 📄
    PROPERTY: ICONS.PROPERTY,           // 🏘️
    TAX_PAYMENT: ICONS.TAX_PAYMENT,     // 💰
    ELECTRICITY: ICONS.ELECTRICITY,     // 💡
    WATER: ICONS.WATER,                 // 💧
    WASTE_MANAGEMENT: ICONS.WASTE_MANAGEMENT // 🚮
  },

  NAVIGATION: {
    HOME: ICONS.HOME,               // 🏠
    DASHBOARD: ICONS.DASHBOARD,     // 📊
    SETTINGS: ICONS.SETTINGS,       // ⚙️
    CONTACT: ICONS.CONTACT,         // 📞
    MENU: ICONS.MENU,               // ☰
    BACK: ICONS.BACK,               // ⬅️
    INFO: ICONS.INFO                // ℹ️
  },

  ACTIONS: {
    EDIT: ICONS.EDIT,               // ✏️
    DELETE: ICONS.DELETE,           // 🗑️
    SAVE: ICONS.SAVE,               // 💾
    SEARCH: ICONS.SEARCH,           // 🔍
    ADD: ICONS.ADD,                 // ➕
    REMOVE: ICONS.REMOVE,           // ➖
    REFRESH: ICONS.REFRESH          // 🔃
  },

  CERTIFICATES: {
    BIRTH: ICONS.BIRTH_CERTIFICATE,     // 👶
    DEATH: ICONS.DEATH_CERTIFICATE,     // ⚰️
    MARRIAGE: ICONS.MARRIAGE_CERTIFICATE, // 💒
    INCOME: ICONS.INCOME_CERTIFICATE,   // 💼
    CASTE: ICONS.CASTE_CERTIFICATE,     // 📜
    DOMICILE: ICONS.DOMICILE_CERTIFICATE // 🏪
  },

  FINANCIAL: {
    PAYMENT: ICONS.PAYMENT,         // 💳
    MONEY: ICONS.MONEY,             // 💵
    BANK: ICONS.BANK,               // 🏦
    RECEIPT: ICONS.RECEIPT,         // 🧾
    BILL: ICONS.BILL,               // 💸
    TAX: ICONS.TAX_PAYMENT          // 💰
  }
} as const;