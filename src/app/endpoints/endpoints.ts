export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/loginUser',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
    },

    USER: {
        GET_USER_BY_ID: (userId: string) =>
            `/auth/getUserById/${userId}`,
        GET_DIGITAL_USER_DATA: (userId: string) =>
            `/auth/getDigitalUserdataBy/${userId}`,
    },

    PROFILE: {
        ADD_SOCIAL_ACCOUNT: '/setting/addSocialMediaAccounts',
        GET_USER_SOCIAL_ACCOUNT: (userId: string) =>
            `/setting/getUserSocialAccountDetails/${userId}`,
    },

    AI_CALENDAR: {
        CREATE: '/aicalender/createMarketingCalendar',
        GET_BY_USER_ID: (userId: string) =>
            `/aicalender/getMarketingCalendar/${userId}`,
    },

    WALLET: {
        GET_WALLET_DATA: (userId: string) =>
            `/wallet/getWalletData/${userId}`,
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
    },

    INCIDENTS: {
        CREATE: '/incidents/createIncidents',
        GET_BY_USER_ID: (userId: string) =>
            `/incidents/getIncidentsByUserId/${userId}`,
    },
};