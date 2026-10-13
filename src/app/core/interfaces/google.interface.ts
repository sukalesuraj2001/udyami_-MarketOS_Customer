/** Backend product keys (GET /google/connections). */
export type GoogleProduct = 'ANALYTICS' | 'YOUTUBE' | 'ADS';

/** What the member must do, if anything, for a Google connection. */
export type GoogleConnectionStatus = 'CONNECTED' | 'NEEDS_SELECTION' | 'BROKEN';

export interface GoogleConnection {
  product: GoogleProduct;
  connected: boolean;
  status: GoogleConnectionStatus | null;
  /** Why it needs attention, e.g. "Access to YouTube was removed. Please reconnect." */
  statusReason: string | null;
  googleAccountEmail: string | null;
  /** GA4 "properties/123…" or the YouTube channel id. */
  resourceId: string | null;
  /** Property or channel name. */
  resourceName: string | null;
  connectedAt: string | null;
  lastVerifiedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
}

export interface Ga4Property {
  propertyId: string;
  displayName: string;
  accountName: string;
  selected: boolean;
}

export interface Ga4PropertyList {
  googleAccountEmail: string | null;
  selectedPropertyId: string | null;
  properties: Ga4Property[];
}

export interface GaNamedValue {
  name: string;
  value: number;
}

export interface GoogleAnalyticsReport {
  connection: {
    status: GoogleConnectionStatus;
    statusReason: string | null;
    propertyId: string | null;
    propertyName: string | null;
    lastSyncedAt: string | null;
    lastSyncError: string | null;
  } | null;
  startDate: string;
  endDate: string;
  totals: {
    sessions: number;
    newUsers: number;
    pageViews: number;
    keyEvents: number;
  };
  traffic: { date: string; sessions: number; users: number; newUsers: number }[];
  sources: GaNamedValue[];
  pages: GaNamedValue[];
  events: GaNamedValue[];
  keyEvents: GaNamedValue[];
  devices: GaNamedValue[];
  campaigns: GaNamedValue[];
}
