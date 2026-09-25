import { UserProfile } from './profile';

const PERSONAL_FIELDS = [
  'username', 'gender', 'email', 'mobileNumber', 'alternateMobile', 'homeAddress', 'officeAddress',
  'state', 'district', 'assembly', 'ward', 'pincode', 'familyCount', 'interests', 'hobbies', 'profileImage',
] as const;

const BUSINESS_FIELDS = [
  'businessName', 'sector', 'businessType', 'ownerName', 'establishedYear', 'employees', 'annualTurnover',
  'gstNumber', 'address', 'city', 'state', 'pincode', 'email', 'businessMobile',
] as const;

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export interface ProfileCompletion {
  /** 0–100, rounded. */
  percent: number;
  hasProfile: boolean;
  hasBusinessDetails: boolean;
}

/** How much of the profile (personal + business) is filled in. */
export function getProfileCompletion(user: UserProfile | null | undefined): ProfileCompletion {
  const profile = user?.profile ?? null;
  const business = profile?.businessDetails ?? null;

  const hasProfile = !!profile && Object.values(profile).some(isFilled);
  const hasBusinessDetails = !!business && Object.values(business).some(isFilled);

  const personalFilled = PERSONAL_FIELDS.filter((key) => isFilled(profile?.[key])).length;
  const businessFilled = BUSINESS_FIELDS.filter((key) => isFilled(business?.[key])).length;
  const total = PERSONAL_FIELDS.length + BUSINESS_FIELDS.length;

  return {
    percent: Math.round(((personalFilled + businessFilled) / total) * 100),
    hasProfile,
    hasBusinessDetails,
  };
}
