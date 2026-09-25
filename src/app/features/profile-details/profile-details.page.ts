import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { Profile, UserProfile } from '@app/core/services/profileService/profile';
import { getProfileCompletion } from '@app/core/services/profileService/profile-completion';
import { BusinessReminderComponent } from '@shared/components/business-reminder/business-reminder.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

interface DetailRow {
  label: string;
  value: string;
  href?: string;
}

interface DetailSection {
  title: string;
  icon: string;
  rows: DetailRow[];
  chips?: { label: string; values: string[] }[];
}

interface ProductView {
  name: string;
  category: string;
  description: string;
  price: string;
  images: string[];
}

interface EventView {
  name: string;
  localName: string;
  positioning: string;
  dates: string;
  venue: string;
  entryFee: string;
  counts: { label: string; value: number }[];
  statistics: { label: string; value: string }[];
}

type Json = Record<string, unknown>;

const asObject = (value: unknown): Json => (value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Accepts API values that may be arrays or comma-separated strings. */
function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value).trim();
}

const isUrl = (value: string) => /^(https?:)?\/\//.test(value) || value.startsWith('/');

const inr = (value: unknown): string => {
  const n = Number(value);
  return value === null || value === undefined || value === '' || !Number.isFinite(n) ? '' : `₹${n.toLocaleString('en-IN')}`;
};

const formatDate = (value: string): string => {
  const time = Date.parse(value);
  return Number.isFinite(time)
    ? new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : value;
};

/** "hobliAndWards" → "Hobli and wards" */
const humanize = (key: string): string => {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, IonicModule, ThemeToggleComponent, BusinessReminderComponent],
  templateUrl: './profile-details.page.html',
  styleUrls: ['./profile-details.page.scss'],
})
export class ProfileDetailsPage {
  private readonly profileService = inject(Profile);
  private readonly router = inject(Router);

  readonly user = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly completion = computed(() => getProfileCompletion(this.user()));
  readonly hasProfile = computed(() => this.completion().hasProfile);

  readonly displayName = computed(() => this.user()?.name || 'Your profile');
  readonly profileImage = computed(() => this.user()?.profile?.profileImage || null);
  readonly initials = computed(() => this.displayName()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase());

  private readonly business = computed(() => asObject(this.user()?.profile?.businessDetails));

  readonly brand = computed(() => {
    const b = this.business();
    return {
      logo: isUrl(text(b['logo'])) ? text(b['logo']) : '',
      name: text(b['businessName']),
      tagline: text(b['tagline']),
      type: text(b['businessType']),
    };
  });

  readonly sections = computed<DetailSection[]>(() => {
    const user = this.user();
    const p = user?.profile ?? {};
    const b = this.business();
    const phone = (value: unknown) => (text(value) ? `tel:${text(value)}` : undefined);
    const mail = (value: unknown) => (text(value) ? `mailto:${text(value)}` : undefined);

    const sections: DetailSection[] = [
      {
        title: 'Personal',
        icon: 'person-outline',
        rows: [
          { label: 'Full name', value: text(user?.name) },
          { label: 'Username', value: text(p.username) },
          { label: 'Gender', value: text(p.gender) },
          { label: 'Business vertical', value: text(p.selectedBusinessVertical) },
        ],
      },
      {
        title: 'Contact',
        icon: 'call-outline',
        rows: [
          { label: 'Email', value: text(p.email || user?.email), href: mail(p.email || user?.email) },
          { label: 'Mobile', value: text(p.mobileNumber || user?.mobileNumber), href: phone(p.mobileNumber || user?.mobileNumber) },
          { label: 'Alternate mobile', value: text(p.alternateMobile), href: phone(p.alternateMobile) },
        ],
      },
      {
        title: 'Address & constituency',
        icon: 'location-outline',
        rows: [
          { label: 'Home address', value: text(p.homeAddress || user?.homeLocation) },
          { label: 'Office address', value: text(p.officeAddress) },
          { label: 'Ward', value: text(p.ward) },
          { label: 'Assembly', value: text(p.assembly) },
          { label: 'District', value: text(p.district) },
          { label: 'State', value: text(p.state) },
          { label: 'Pincode', value: text(p.pincode) },
        ],
      },
      {
        title: 'Family & interests',
        icon: 'people-outline',
        rows: [{ label: 'Family members', value: text(p.familyCount) }],
        chips: [
          { label: 'Children', values: toList(p.children) },
          { label: 'Interests', values: toList(p.interests) },
          { label: 'Hobbies', values: toList(p.hobbies) },
        ],
      },
    ];

    if (Object.keys(b).length) {
      const lat = text(b['latitude']);
      const lng = text(b['longitude']);
      const website = text(b['website']);
      sections.push(
        {
          title: 'Business',
          icon: 'briefcase-outline',
          rows: [
            { label: 'Sector', value: text(b['sector']) },
            { label: 'Owner', value: text(b['ownerName']) },
            { label: 'Co-organiser', value: text(b['coOrganiser']) },
            { label: 'Established', value: text(b['establishedYear']) },
            { label: 'Employees', value: text(b['employees']) },
            { label: 'Annual turnover', value: text(b['annualTurnover']) },
            { label: 'GST number', value: text(b['gstNumber']) },
            { label: 'Registration no.', value: text(b['registrationNumber']) },
          ],
        },
        {
          title: 'Business contact',
          icon: 'globe-outline',
          rows: [
            { label: 'Email', value: text(b['email']), href: mail(b['email']) },
            { label: 'PR email', value: text(b['prEmail']), href: mail(b['prEmail']) },
            { label: 'Mobile', value: text(b['businessMobile']), href: phone(b['businessMobile']) },
            { label: 'Website', value: website, href: website || undefined },
            { label: 'Mobile app', value: text(b['mobileApp']) },
            {
              label: 'Address',
              value: [b['address'], b['city'], b['district'], b['state'], b['pincode']].map(text).filter(Boolean).join(', '),
            },
            {
              label: 'Map location',
              value: lat && lng ? `${lat}, ${lng}` : '',
              href: lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : undefined,
            },
          ],
        },
      );
    }

    return sections
      .map((section) => ({
        ...section,
        rows: section.rows.filter((row) => row.value),
        chips: section.chips?.filter((chip) => chip.values.length),
      }))
      .filter((section) => section.rows.length || section.chips?.length);
  });

  readonly products = computed<ProductView[]>(() =>
    asArray(this.business()['products']).map((item) => {
      const p = asObject(item);
      const unit = text(p['unit']);
      const price = inr(p['price']);
      return {
        name: text(p['name']),
        category: text(p['category']),
        description: text(p['description']),
        price: price && unit ? `${price} · ${unit}` : price,
        images: asArray(p['images']).map(text).filter(isUrl),
      };
    }).filter((product) => product.name)
  );

  readonly gallery = computed(() => toList(this.user()?.profile?.businessImages).filter(isUrl));

  readonly event = computed<EventView | null>(() => {
    const e = asObject(this.business()['expo']);
    if (!Object.keys(e).length) return null;

    const venue = asObject(e['venue']);
    const start = text(e['startDate']);
    const end = text(e['endDate']);
    const days = text(e['days']);
    const dates = [start && formatDate(start), end && end !== start ? formatDate(end) : ''].filter(Boolean).join(' – ');

    const count = (key: string) => asArray(e[key]).length;
    const counts = [
      { label: 'Zones', value: count('zones') },
      { label: 'Sectors', value: count('sectors') },
      { label: 'Stall packages', value: count('stallPackages') },
      { label: 'Sponsorships', value: count('sponsorshipPackages') },
      { label: 'Add-ons', value: count('addOns') },
      { label: 'Partners', value: count('governmentPartnerships') },
      { label: 'Schedule days', value: count('schedule') },
      { label: 'Contacts', value: count('bookingContacts') },
    ].filter((item) => item.value > 0);

    return {
      name: text(e['eventName']) || 'Your event',
      localName: text(e['localName']),
      positioning: text(e['positioning']),
      dates: days && dates ? `${dates} · ${days} days` : dates,
      venue: [venue['name'], venue['city']].map(text).filter(Boolean).join(', '),
      entryFee: text(e['entryFee']),
      counts,
      statistics: Object.entries(asObject(e['statistics']))
        .map(([key, value]) => ({ label: humanize(key), value: text(value) }))
        .filter((item) => item.value)
        .slice(0, 6),
    };
  });

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);

    this.profileService.getUserProfileData().subscribe({
      next: (response) => {
        this.user.set(response.data ?? null);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(error.error?.message || 'We could not load your profile. Please try again.');
      },
    });
  }

  edit(section?: 'business' | 'products' | 'event'): void {
    void this.router.navigate(['/tabs/profile-edit'], section ? { queryParams: { section } } : {});
  }
}
