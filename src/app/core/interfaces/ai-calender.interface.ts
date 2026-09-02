export interface CreateMarketingCalendarPayload {
    userId: string;
}

export interface MarketingCalendarActivity {
    day: number;
    date: string;
    time: string;
    activity: string;
    platform: string;
    title: string;
    description: string;
    product?: string;
}

export interface MarketingCalendar {
    id: string;
    userId: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    calendar: MarketingCalendarActivity[];
    createdAt: string;
    updatedAt: string;
}

export interface MarketingCalendarResponse {
    success: boolean;
    message: string;
    data: MarketingCalendar;
}