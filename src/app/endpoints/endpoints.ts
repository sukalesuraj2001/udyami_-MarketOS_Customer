export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/loginUser',
        REGISTER: '/auth/createUser',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
    },

    USER: {
        GET_USER_BY_ID: (userId: string) =>
            `/auth/getUserById/${userId}`,
        GET_DIGITAL_USER_DATA: (userId: string) =>
            `/auth/getDigitalUserdataBy/${userId}`,
    },

    USER_PROFILE: {
        CREATE: '/userprofile/createUserProfile',
    },

    PROFILE: {
        ADD_SOCIAL_ACCOUNT: '/setting/addSocialMediaAccounts',
        GET_USER_SOCIAL_ACCOUNT: (userId: string) =>
            `/setting/getUserSocialAccountDetails/${userId}`,
    },

    FACEBOOK: {
        OAUTH_CONNECT: '/facebook/oauth/connect',
        PAGES: '/facebook/pages',
        SELECT_PAGE: '/facebook/pages/select',
        AD_ACCOUNTS: '/facebook/ad-accounts',
        SELECT_AD_ACCOUNT: '/facebook/ad-accounts/select',
        DISCONNECT: '/facebook/disconnect',
    },

    LEADS: {
        GET_ALL: '/facebook/leads',
        PULL: '/facebook/leads/pull',
    },

    GOOGLE: {
        OAUTH_CONNECT: '/google/oauth/connect',
        CONNECTIONS: '/google/connections',
        DISCONNECT: (product: string) => `/google/connections/${product}`,
        ANALYTICS_PROPERTIES: '/google/analytics/properties',
        ANALYTICS_SELECT_PROPERTY: '/google/analytics/property',
        ANALYTICS_REPORT: '/google/analytics/report',
        YOUTUBE_CHANNEL: '/google/youtube/channel',
    },

    AI_CALENDAR: {
        CREATE: '/aicalender/createMarketingCalendar',
        GET_BY_USER_ID: (userId: string) =>
            `/aicalender/getMarketingCalendar/${userId}`,
    },

    MEMBERSHIP: {
        // Disabled server-side (410 Gone) — manual credits were replaced by
        // the verified Razorpay purchase flow below. Kept only so nothing
        // points at a dangling string literal.
        ACTIVATE_DIGITAL_USER: '/membership-purchase/activate-digital-user',

        GET_ALL_PLANS: '/membership-purchase/membershipAllPlans',
        CREATE_ORDER: '/membership-purchase/create-order',
        VERIFY_PAYMENT: '/membership-purchase/verify-payment',
        HISTORY: '/membership-purchase/membership-history',
        RECEIPT: (paymentId: string) =>
            `/membership-purchase/receipt/${paymentId}`,
    },

    WALLET: {
        GET_WALLET_DATA: (userId: string) =>
            `/wallet/getWalletData/${userId}`,
        GET_WALLET_HISTORY: (userId: string) =>
            `/wallet/getWalletHistory/${userId}`,
    },

    // Separate from WALLET — this is the dedicated ad-spend budget the user
    // pays into specifically to run/boost ads on Facebook or Google.
    AD_BUDGET: {
        CREATE_ORDER: '/ad-budget/create-order',
        VERIFY_PAYMENT: '/ad-budget/verify-payment',
        GET_BUDGET: (userId: string) => `/ad-budget/${userId}`,
        GET_HISTORY: (userId: string) => `/ad-budget/history/${userId}`,
    },

    GENERATED_CONTENT: {
        GET_BY_USER_ID: (userId: string) =>
            `/create-content/getGeneratedContent/${userId}`,

        REGENERATE: (contentId: string) =>
            `/create-content/regenerateContent/${contentId}`,

        REJECT: (contentId: string) =>
            `/create-content/rejectContent/${contentId}`,

        PUBLISH: '/create-content/publishContent',

        DOWNLOAD_REPORT: '/create-content/download-report',

        ANALYTICS: (userId: string, platform: string) =>
            `/create-content/analytics/${userId}/${platform.toUpperCase()}`,

        POST_METRICS: (userId: string, platform: string) =>
            `/create-content/post-metrics/${userId}/${platform.toUpperCase()}`,

        USAGE: (userId: string) =>
            `/create-content/usage/${userId}`,
    },

    ASK_UB: {
        CHAT: '/ask-ub/chat',
    },

    INCIDENTS: {
        CREATE: '/incidents/createIncidents',
        GET_BY_USER_ID: (userId: string) =>
            `/incidents/getIncidentsByUserId/${userId}`,
    },
};
