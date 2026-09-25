/**
 * Form models for the `businessDetails` JSON field and helpers that convert
 * between the saved JSON and editable form state.
 *
 * Multi-line text areas hold string lists ("one item per line"); repeatable
 * tables hold rows of plain values and are described by `RepeatColumn`s.
 */

import { RepeatColumn, RepeatRow } from '@shared/components/repeat-list/repeat-list.types';

export type { RepeatColumn, RepeatRow };

export interface RepeatTable {
  key: keyof ExpoTables;
  title: string;
  icon: string;
  itemLabel: string;
  hint?: string;
  columns: RepeatColumn[];
}

export interface BusinessCoreForm {
  businessName: string;
  tagline: string;
  sector: string;
  businessType: string;
  ownerName: string;
  coOrganiser: string;
  establishedYear: number | null;
  employees: number | null;
  annualTurnover: string;
  gstNumber: string;
  registrationNumber: string;
  logo: string;
  website: string;
  mobileApp: string;
  email: string;
  prEmail: string;
  businessMobile: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ProductForm {
  name: string;
  category: string;
  description: string;
  price: number | null;
  unit: string;
  /** Already-saved image URLs. */
  images: string[];
  /** New images picked on this device. */
  files: File[];
  previews: string[];
}

export interface ExpoTables {
  zones: RepeatRow[];
  sectors: RepeatRow[];
  sevenPillars: RepeatRow[];
  stallPackages: RepeatRow[];
  addOns: RepeatRow[];
  marketingOptions: RepeatRow[];
  sponsorshipPackages: RepeatRow[];
  bookingContacts: RepeatRow[];
  governmentPartnerships: RepeatRow[];
  schedule: RepeatRow[];
  statistics: RepeatRow[];
}

export interface ExpoForm extends ExpoTables {
  eventName: string;
  localName: string;
  edition: number | null;
  positioning: string;
  startDate: string;
  endDate: string;
  currency: string;
  entryFee: string;
  gstPercent: number | null;
  registrationNote: string;
  creativeNote: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueTotalAreaSqm: number | null;
  venueExhibitionHall: string;
  venueAreas: string;
  stages: string;
  audience: string;
  eventSpectrum: string;
  guestInvitees: string;
  publicityPlan: string;
  stallInclusions: string;
}

/** Simple string lists inside `expo`, edited as one item per line. */
export const EXPO_LISTS: { key: keyof ExpoForm; label: string; placeholder: string }[] = [
  { key: 'stages', label: 'Stages', placeholder: 'Mega Event Hall (Jacaranda)' },
  { key: 'audience', label: 'Target audience', placeholder: 'Investors, VCs & angel funding bodies' },
  { key: 'eventSpectrum', label: 'Event highlights', placeholder: 'Mega Exhibition' },
  { key: 'guestInvitees', label: 'Guest invitees', placeholder: 'State and Central Cabinet Ministers' },
  { key: 'publicityPlan', label: 'Publicity plan', placeholder: 'Social Media: Reels, organic posts, paid ads' },
  { key: 'stallInclusions', label: 'Stall inclusions', placeholder: '1 table and 2 chairs' },
];

export const EXPO_TABLES: RepeatTable[] = [
  {
    key: 'zones', title: 'Zones', icon: 'grid-outline', itemLabel: 'Zone',
    columns: [
      { key: 'code', label: 'Code', placeholder: 'A' },
      { key: 'stalls', label: 'Stalls', type: 'number', placeholder: '30' },
      { key: 'name', label: 'Zone name', placeholder: 'Health, Wellness & Government', full: true },
    ],
  },
  {
    key: 'sectors', title: 'Sectors', icon: 'layers-outline', itemLabel: 'Sector',
    columns: [
      { key: 'number', label: 'No.', type: 'number', placeholder: '1' },
      { key: 'name', label: 'Sector name', placeholder: 'Reality Sector — Tech-Enabled Realty', full: true },
      { key: 'strapline', label: 'Strapline', placeholder: 'Digitise. Invest. Build Smarter.', full: true },
    ],
  },
  {
    key: 'sevenPillars', title: 'Pillars', icon: 'podium-outline', itemLabel: 'Pillar',
    columns: [
      { key: 'pillar', label: 'Pillar', placeholder: 'Innovation', full: true },
      { key: 'summary', label: 'Summary', type: 'textarea', placeholder: 'What this pillar delivers', full: true },
    ],
  },
  {
    key: 'stallPackages', title: 'Stall packages', icon: 'cube-outline', itemLabel: 'Package',
    hint: 'GST amount and total are calculated from the GST % above.',
    columns: [
      { key: 'package', label: 'Package', placeholder: 'Shell Scheme (3x3)', full: true },
      { key: 'areaSqm', label: 'Area (sqm)', type: 'number', placeholder: '9' },
      { key: 'priceExclGst', label: 'Price excl. GST (₹)', type: 'number', placeholder: '99000' },
    ],
  },
  {
    key: 'addOns', title: 'Add-ons', icon: 'add-circle-outline', itemLabel: 'Add-on',
    columns: [
      { key: 'item', label: 'Item', placeholder: 'LED Backwall Screen (21 inches)', full: true },
      { key: 'unit', label: 'Unit', placeholder: 'Per stall' },
      { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '15000' },
      { key: 'priceNote', label: 'Price note', placeholder: 'From ₹25,000', full: true },
    ],
  },
  {
    key: 'marketingOptions', title: 'Marketing options', icon: 'megaphone-outline', itemLabel: 'Option',
    columns: [
      { key: 'option', label: 'Option', placeholder: 'Digital Bus Stop Ads', full: true },
      { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '15000' },
      { key: 'details', label: 'Details', type: 'textarea', placeholder: '15 days campaign; 1 bus stop…', full: true },
    ],
  },
  {
    key: 'sponsorshipPackages', title: 'Sponsorship packages', icon: 'trophy-outline', itemLabel: 'Tier',
    columns: [
      { key: 'tier', label: 'Tier', placeholder: 'Title Sponsor', full: true },
      { key: 'price', label: 'Price (₹)', type: 'number', placeholder: '5000000' },
      { key: 'vipPasses', label: 'VIP passes', type: 'number', placeholder: '20' },
      { key: 'stallAreaSqm', label: 'Stall area (sqm)', type: 'number', placeholder: '54' },
      { key: 'note', label: 'Note', placeholder: 'Per sector' },
    ],
  },
  {
    key: 'bookingContacts', title: 'Booking contacts', icon: 'call-outline', itemLabel: 'Contact',
    columns: [
      { key: 'name', label: 'Name', placeholder: 'Sri. Prasanna' },
      { key: 'mobile', label: 'Mobile', placeholder: '+91 78992 53363' },
    ],
  },
  {
    key: 'governmentPartnerships', title: 'Government partnerships', icon: 'business-outline', itemLabel: 'Partner',
    columns: [
      { key: 'entity', label: 'Entity', placeholder: 'MSME Department & MSME Associations', full: true },
      { key: 'reach', label: 'Reach', placeholder: '10,000+ entrepreneurs' },
      { key: 'stalls', label: 'Stalls', type: 'number', placeholder: '60' },
    ],
  },
  {
    key: 'schedule', title: 'Schedule', icon: 'time-outline', itemLabel: 'Day',
    hint: 'Enter each session on its own line.',
    columns: [
      { key: 'day', label: 'Day', type: 'number', placeholder: '1' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'megaEventHall', label: 'Mega event hall', type: 'lines', full: true },
      { key: 'businessConclave', label: 'Business conclave', type: 'lines', full: true },
      { key: 'oneTalukOneProduct', label: 'One Taluk. One Product', type: 'lines', full: true },
      { key: 'businessGratitudeHall', label: 'Business gratitude hall', type: 'lines', full: true },
    ],
  },
  {
    key: 'statistics', title: 'Key numbers', icon: 'stats-chart-outline', itemLabel: 'Figure',
    columns: [
      { key: 'key', label: 'Metric', placeholder: 'visitors' },
      { key: 'value', label: 'Value', placeholder: '100,000+' },
    ],
  },
];

// ---------------------------------------------------------------- helpers

type Json = Record<string, unknown>;

const str = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const asObject = (value: unknown): Json => (value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {});

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export const linesToText = (value: unknown): string => asArray(value).map(str).filter(Boolean).join('\n');

export const textToLines = (value: string): string[] =>
  value.split('\n').map((line) => line.trim()).filter(Boolean);

function rowsFromJson(value: unknown, columns: RepeatColumn[]): RepeatRow[] {
  return asArray(value).map((item) => {
    const source = asObject(item);
    const row: RepeatRow = {};
    for (const column of columns) {
      const raw = source[column.key];
      row[column.key] = column.type === 'number' ? num(raw) : column.type === 'lines' ? linesToText(raw) : str(raw);
    }
    return row;
  });
}

function rowsToJson(rows: RepeatRow[], columns: RepeatColumn[]): Json[] {
  return rows
    .filter((row) => columns.some((column) => str(row[column.key]).trim() !== ''))
    .map((row) => {
      const item: Json = {};
      for (const column of columns) {
        const raw = row[column.key];
        if (column.type === 'number') item[column.key] = num(raw);
        else if (column.type === 'lines') item[column.key] = textToLines(str(raw));
        else item[column.key] = str(raw).trim() || null;
      }
      return item;
    });
}

const columnsOf = (key: keyof ExpoTables): RepeatColumn[] =>
  EXPO_TABLES.find((table) => table.key === key)!.columns;

// ---------------------------------------------------------------- business core

export function businessFromJson(value: unknown): BusinessCoreForm {
  const b = asObject(value);
  return {
    businessName: str(b['businessName']),
    tagline: str(b['tagline']),
    sector: str(b['sector']),
    businessType: str(b['businessType']),
    ownerName: str(b['ownerName']),
    coOrganiser: str(b['coOrganiser']),
    establishedYear: num(b['establishedYear']),
    employees: num(b['employees']),
    annualTurnover: str(b['annualTurnover']),
    gstNumber: str(b['gstNumber']),
    registrationNumber: str(b['registrationNumber']),
    logo: str(b['logo']),
    website: str(b['website']),
    mobileApp: str(b['mobileApp']),
    email: str(b['email']),
    prEmail: str(b['prEmail']),
    businessMobile: str(b['businessMobile']),
    address: str(b['address']),
    city: str(b['city']),
    district: str(b['district']),
    state: str(b['state']),
    pincode: str(b['pincode']),
    latitude: num(b['latitude']),
    longitude: num(b['longitude']),
  };
}

// ---------------------------------------------------------------- products

export function productsFromJson(value: unknown): ProductForm[] {
  return asArray(asObject(value)['products']).map((item) => {
    const p = asObject(item);
    return {
      name: str(p['name']),
      category: str(p['category']),
      description: str(p['description']),
      price: num(p['price']),
      unit: str(p['unit']),
      images: asArray(p['images']).map(str).filter(Boolean),
      files: [],
      previews: [],
    };
  });
}

export function emptyProduct(): ProductForm {
  return { name: '', category: '', description: '', price: null, unit: '', images: [], files: [], previews: [] };
}

// ---------------------------------------------------------------- expo

export function emptyExpo(): ExpoForm {
  return expoFromJson({});
}

export function expoFromJson(value: unknown): ExpoForm {
  const e = asObject(value);
  const venue = asObject(e['venue']);
  const statistics = Object.entries(asObject(e['statistics'])).map(([key, v]) => ({ key, value: str(v) }));

  return {
    eventName: str(e['eventName']),
    localName: str(e['localName']),
    edition: num(e['edition']),
    positioning: str(e['positioning']),
    startDate: str(e['startDate']),
    endDate: str(e['endDate']),
    currency: str(e['currency']) || 'INR',
    entryFee: str(e['entryFee']),
    gstPercent: num(e['gstPercent']) ?? 18,
    registrationNote: str(e['registrationNote']),
    creativeNote: str(e['creativeNote']),
    venueName: str(venue['name']),
    venueCity: str(venue['city']),
    venueState: str(venue['state']),
    venueTotalAreaSqm: num(venue['totalAreaSqm']),
    venueExhibitionHall: str(venue['exhibitionHall']),
    venueAreas: linesToText(venue['areas']),
    stages: linesToText(e['stages']),
    audience: linesToText(e['audience']),
    eventSpectrum: linesToText(e['eventSpectrum']),
    guestInvitees: linesToText(e['guestInvitees']),
    publicityPlan: linesToText(e['publicityPlan']),
    stallInclusions: linesToText(e['stallInclusions']),
    zones: rowsFromJson(e['zones'], columnsOf('zones')),
    sectors: rowsFromJson(e['sectors'], columnsOf('sectors')),
    sevenPillars: rowsFromJson(e['sevenPillars'], columnsOf('sevenPillars')),
    stallPackages: rowsFromJson(e['stallPackages'], columnsOf('stallPackages')),
    addOns: rowsFromJson(e['addOns'], columnsOf('addOns')),
    marketingOptions: rowsFromJson(e['marketingOptions'], columnsOf('marketingOptions')),
    sponsorshipPackages: rowsFromJson(e['sponsorshipPackages'], columnsOf('sponsorshipPackages')),
    bookingContacts: rowsFromJson(e['bookingContacts'], columnsOf('bookingContacts')),
    governmentPartnerships: rowsFromJson(e['governmentPartnerships'], columnsOf('governmentPartnerships')),
    schedule: rowsFromJson(e['schedule'], columnsOf('schedule')),
    statistics,
  };
}

/** Inclusive number of days between two ISO dates, or null. */
export function eventDays(startDate: string, endDate: string): number | null {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.round((end - start) / 86_400_000) + 1;
}

/**
 * Builds the `expo` JSON. Keys the form doesn't manage are kept from
 * `existing` so nothing saved elsewhere is lost.
 */
export function expoToJson(form: ExpoForm, existing: unknown): Json {
  const base = asObject(existing);
  const baseVenue = asObject(base['venue']);
  const gst = form.gstPercent ?? 0;

  const stallPackages = rowsToJson(form.stallPackages, columnsOf('stallPackages')).map((pkg) => {
    const price = num(pkg['priceExclGst']);
    const gstAmount = price === null ? null : Math.round((price * gst) / 100);
    return { ...pkg, gstAmount, totalInclGst: price === null || gstAmount === null ? null : price + gstAmount };
  });

  const statistics: Json = {};
  for (const row of form.statistics) {
    const key = str(row['key']).trim();
    const value = str(row['value']).trim();
    // keep plain numbers (e.g. taluks: 96) numeric; "100,000+" stays text
    if (key) statistics[key] = /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
  }

  return {
    ...base,
    eventName: form.eventName.trim() || null,
    localName: form.localName.trim() || null,
    edition: form.edition,
    positioning: form.positioning.trim() || null,
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    days: eventDays(form.startDate, form.endDate),
    currency: form.currency.trim() || 'INR',
    entryFee: form.entryFee.trim() || null,
    gstPercent: form.gstPercent,
    registrationNote: form.registrationNote.trim() || null,
    creativeNote: form.creativeNote.trim() || null,
    venue: {
      ...baseVenue,
      name: form.venueName.trim() || null,
      city: form.venueCity.trim() || null,
      state: form.venueState.trim() || null,
      totalAreaSqm: form.venueTotalAreaSqm,
      exhibitionHall: form.venueExhibitionHall.trim() || null,
      areas: textToLines(form.venueAreas),
    },
    stages: textToLines(form.stages),
    audience: textToLines(form.audience),
    eventSpectrum: textToLines(form.eventSpectrum),
    guestInvitees: textToLines(form.guestInvitees),
    publicityPlan: textToLines(form.publicityPlan),
    stallInclusions: textToLines(form.stallInclusions),
    zones: rowsToJson(form.zones, columnsOf('zones')),
    sectors: rowsToJson(form.sectors, columnsOf('sectors')),
    sevenPillars: rowsToJson(form.sevenPillars, columnsOf('sevenPillars')),
    stallPackages,
    addOns: rowsToJson(form.addOns, columnsOf('addOns')),
    marketingOptions: rowsToJson(form.marketingOptions, columnsOf('marketingOptions')),
    sponsorshipPackages: rowsToJson(form.sponsorshipPackages, columnsOf('sponsorshipPackages')),
    bookingContacts: rowsToJson(form.bookingContacts, columnsOf('bookingContacts')),
    governmentPartnerships: rowsToJson(form.governmentPartnerships, columnsOf('governmentPartnerships')),
    schedule: rowsToJson(form.schedule, columnsOf('schedule')),
    statistics,
  };
}

// ---------------------------------------------------------------- full businessDetails

export interface BusinessImageRefs {
  /** File name of a new logo sent in `businessImages`, if any. */
  logoFileName: string | null;
  /** Per product, the file names of new images sent in `businessImages`. */
  productFileNames: string[][];
}

/**
 * Builds the `businessDetails` JSON. Unknown keys from `existing` are kept;
 * `expo` is dropped when the business does not run events.
 */
export function businessToJson(
  core: BusinessCoreForm,
  products: ProductForm[],
  expo: ExpoForm | null,
  existing: unknown,
  refs: BusinessImageRefs,
): Json {
  const base = { ...asObject(existing) };
  const clean = (value: string) => value.trim() || null;

  const result: Json = {
    ...base,
    businessName: clean(core.businessName),
    tagline: clean(core.tagline),
    sector: clean(core.sector),
    businessType: clean(core.businessType),
    ownerName: clean(core.ownerName),
    coOrganiser: clean(core.coOrganiser),
    establishedYear: core.establishedYear,
    employees: core.employees,
    annualTurnover: clean(core.annualTurnover),
    gstNumber: core.gstNumber.trim() ? core.gstNumber.trim().toUpperCase() : null,
    registrationNumber: clean(core.registrationNumber),
    logo: clean(core.logo),
    website: clean(core.website),
    mobileApp: clean(core.mobileApp),
    email: core.email.trim() ? core.email.trim().toLowerCase() : null,
    prEmail: core.prEmail.trim() ? core.prEmail.trim().toLowerCase() : null,
    businessMobile: clean(core.businessMobile),
    address: clean(core.address),
    city: clean(core.city),
    district: clean(core.district),
    state: clean(core.state),
    pincode: clean(core.pincode),
    latitude: core.latitude,
    longitude: core.longitude,
    products: products
      // keep the original index so image file names stay matched to their product
      .map((product, index) => ({ product, fileNames: refs.productFileNames[index] ?? [] }))
      .filter(({ product }) => product.name.trim())
      .map(({ product, fileNames }) => ({
        name: product.name.trim(),
        category: clean(product.category),
        description: clean(product.description),
        price: product.price,
        unit: clean(product.unit),
        images: product.images,
        ...(fileNames.length ? { newImageFiles: fileNames } : {}),
      })),
  };

  if (refs.logoFileName) {
    result['logoFile'] = refs.logoFileName;
  } else {
    delete result['logoFile'];
  }

  if (expo) {
    result['expo'] = expoToJson(expo, base['expo']);
  } else {
    delete result['expo'];
  }

  return result;
}
