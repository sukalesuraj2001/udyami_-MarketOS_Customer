// src/app/core/constants/endpoints.ts

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/loginUser',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh-token',
    },

    USER: {
        GET_USER_BY_ID: (userId: string) => `/auth/getUserById/${userId}`,
    },

    PROFILE: {
        ADD_SOCIAL_ACCOUNT: '/setting/addSocialMediaAccounts',
        GET_USER_SOCIAL_ACCOUNT: (userId: string) =>
            `/setting/getUserSocialAccountDetails/${userId}`,
    }
};