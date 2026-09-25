import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LoaderService } from '@core/services/loader.service';
import { ToastService } from '@core/services/toast.service';
import {
  CreateUserProfilePayload,
  Profile,
  UserProfile,
} from '@app/core/services/profileService/profile';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { RepeatListComponent } from '@shared/components/repeat-list/repeat-list.component';
import {
  BusinessCoreForm,
  EXPO_LISTS,
  EXPO_TABLES,
  ExpoForm,
  ProductForm,
  businessFromJson,
  businessToJson,
  emptyExpo,
  emptyProduct,
  eventDays,
  expoFromJson,
  productsFromJson,
} from './business-form.model';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

type Segment = 'personal' | 'business' | 'products' | 'event';

interface PersonalForm {
  username: string;
  gender: string;
  email: string;
  mobileNumber: string;
  alternateMobile: string;
  homeAddress: string;
  officeAddress: string;
  state: string;
  district: string;
  assembly: string;
  ward: string;
  pincode: string;
  familyCount: number | null;
  children: string;
  interests: string;
  hobbies: string;
  selectedBusinessVertical: string;
  hasBusiness: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const PINCODE_PATTERN = /^\d{6}$/;
const GST_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/;

const text = (value: unknown): string => (value === null || value === undefined ? '' : String(value).trim());

/** Accepts API values that may be arrays or comma-separated strings. */
const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean);
  return text(value).split(',').map((item) => item.trim()).filter(Boolean);
};

/** Prefixes a file name so the backend can tell logo, product and gallery images apart. */
const tagged = (file: File, prefix: string): File =>
  new File([file], `${prefix}__${file.name}`, { type: file.type, lastModified: file.lastModified });

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [BackButtonComponent, CommonModule, FormsModule, IonicModule, ThemeToggleComponent, RepeatListComponent],
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnDestroy {
  private readonly profileService = inject(Profile);
  private readonly loader = inject(LoaderService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly genders = ['Male', 'Female', 'Other'];
  readonly expoLists = EXPO_LISTS;
  readonly expoTables = EXPO_TABLES;

  readonly user = signal<UserProfile | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly locating = signal(false);
  readonly segment = signal<Segment>('personal');
  /** Mirrors `personal.hasBusiness` so the segment list can react to it. */
  readonly hasBusiness = signal(true);

  readonly isNewProfile = computed(() => {
    const profile = this.user()?.profile;
    return !profile || !Object.values(profile).some((value) => text(value) !== '');
  });

  /** Saved gallery URLs (ignores placeholder values that aren't links). */
  readonly savedGallery = computed(() =>
    toList(this.user()?.profile?.businessImages).filter((url) => /^(https?:)?\/\//.test(url) || url.startsWith('/'))
  );

  readonly segments = computed(() => {
    const all: { value: Segment; label: string; icon: string }[] = [
      { value: 'personal', label: 'Personal', icon: 'person-outline' },
      { value: 'business', label: 'Business', icon: 'briefcase-outline' },
      { value: 'products', label: 'Products', icon: 'pricetags-outline' },
      { value: 'event', label: 'Event', icon: 'calendar-number-outline' },
    ];
    return this.hasBusiness() ? all : all.slice(0, 1);
  });

  personal: PersonalForm = this.emptyPersonal();
  business: BusinessCoreForm = businessFromJson({});
  products: ProductForm[] = [];
  runsEvents = false;
  expo: ExpoForm = emptyExpo();

  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  logoFile: File | null = null;
  logoPreview: string | null = null;
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];

  ionViewWillEnter(): void {
    const section = this.route.snapshot.queryParamMap.get('section') as Segment | null;
    this.load(section);
  }

  ngOnDestroy(): void {
    this.releasePreviews();
  }

  // ---------------------------------------------------------------- load

  load(section: Segment | null = null): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.formError.set(null);

    this.profileService.getUserProfileData().subscribe({
      next: (response) => {
        this.user.set(response.data ?? null);
        this.fillForm(response.data ?? null);
        this.loading.set(false);
        this.segment.set(section && this.segments().some((s) => s.value === section) ? section : 'personal');
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.loadError.set(error.error?.message || 'We could not load your profile. Please try again.');
      },
    });
  }

  private fillForm(user: UserProfile | null): void {
    const p = user?.profile ?? {};
    const b = p.businessDetails ?? null;

    this.personal = {
      username: text(p.username),
      gender: text(p.gender),
      email: text(p.email || user?.email),
      mobileNumber: text(p.mobileNumber || user?.mobileNumber),
      alternateMobile: text(p.alternateMobile),
      homeAddress: text(p.homeAddress || user?.homeLocation),
      officeAddress: text(p.officeAddress),
      state: text(p.state),
      district: text(p.district),
      assembly: text(p.assembly),
      ward: text(p.ward),
      pincode: text(p.pincode),
      familyCount: text(p.familyCount) ? Number(p.familyCount) : null,
      children: toList(p.children).join(', '),
      interests: toList(p.interests).join(', '),
      hobbies: toList(p.hobbies).join(', '),
      selectedBusinessVertical: text(p.selectedBusinessVertical),
      hasBusiness: p.hasBusiness === undefined || p.hasBusiness === null
        ? (user?.hasBusiness ?? true)
        : p.hasBusiness === true || p.hasBusiness === 'true',
    };
    this.hasBusiness.set(this.personal.hasBusiness);

    this.business = businessFromJson(b);
    // Fill gaps from registration and personal details.
    this.business.ownerName ||= text(user?.name);
    this.business.address ||= text(user?.businessLocation);
    this.business.state ||= this.personal.state;
    this.business.district ||= this.personal.district;

    this.products = productsFromJson(b);
    const expoJson = (b as Record<string, unknown> | null)?.['expo'];
    this.runsEvents = !!expoJson;
    this.expo = expoJson ? expoFromJson(expoJson) : emptyExpo();

    this.releasePreviews();
    this.profileImageFile = null;
    this.logoFile = null;
    this.galleryFiles = [];
  }

  // ---------------------------------------------------------------- UI events

  setSegment(value: unknown): void {
    this.segment.set(value as Segment);
  }

  onHasBusinessChange(): void {
    this.hasBusiness.set(this.personal.hasBusiness);
    if (!this.personal.hasBusiness) {
      this.segment.set('personal');
    }
  }

  onProfileImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.revoke(this.profileImagePreview);
    this.profileImageFile = file;
    this.profileImagePreview = file ? URL.createObjectURL(file) : null;
  }

  onLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.revoke(this.logoPreview);
    this.logoFile = file;
    this.logoPreview = file ? URL.createObjectURL(file) : null;
  }

  onGallery(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.galleryFiles.push(...files);
    this.galleryPreviews.push(...files.map((file) => URL.createObjectURL(file)));
    (event.target as HTMLInputElement).value = '';
  }

  removeGalleryFile(index: number): void {
    this.revoke(this.galleryPreviews[index]);
    this.galleryFiles.splice(index, 1);
    this.galleryPreviews.splice(index, 1);
  }

  addProduct(): void {
    this.products.push(emptyProduct());
  }

  removeProduct(index: number): void {
    this.products[index].previews.forEach((url) => this.revoke(url));
    this.products.splice(index, 1);
  }

  onProductImages(product: ProductForm, event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    product.files.push(...files);
    product.previews.push(...files.map((file) => URL.createObjectURL(file)));
    (event.target as HTMLInputElement).value = '';
  }

  removeProductFile(product: ProductForm, index: number): void {
    this.revoke(product.previews[index]);
    product.files.splice(index, 1);
    product.previews.splice(index, 1);
  }

  removeProductImage(product: ProductForm, index: number): void {
    product.images.splice(index, 1);
  }

  eventDays(): number | null {
    return eventDays(this.expo.startDate, this.expo.endDate);
  }

  detectBusinessLocation(): void {
    if (!('geolocation' in navigator)) {
      this.formError.set('Location is not available on this device. Enter the coordinates manually.');
      return;
    }

    this.locating.set(true);
    this.loader.show('Finding your location');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.business.latitude = Number(position.coords.latitude.toFixed(6));
        this.business.longitude = Number(position.coords.longitude.toFixed(6));
        this.locating.set(false);
        this.loader.hide();
      },
      () => {
        this.locating.set(false);
        this.loader.hide();
        this.formError.set('Could not read your location. Allow location access or enter the coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  // ---------------------------------------------------------------- save

  save(): void {
    if (this.saving()) {
      return;
    }

    const invalid = this.validate();
    if (invalid) {
      this.segment.set(invalid.segment);
      this.formError.set(invalid.message);
      return;
    }

    const f = this.personal;
    const businessImages: File[] = [];
    let logoFileName: string | null = null;
    const productFileNames: string[][] = [];

    if (f.hasBusiness) {
      if (this.logoFile) {
        const logo = tagged(this.logoFile, 'logo');
        logoFileName = logo.name;
        businessImages.push(logo);
      }
      this.products.forEach((product, index) => {
        const files = product.files.map((file) => tagged(file, `product-${index + 1}`));
        productFileNames.push(files.map((file) => file.name));
        businessImages.push(...files);
      });
      businessImages.push(...this.galleryFiles.map((file) => tagged(file, 'gallery')));
    }

    const payload: CreateUserProfilePayload = {
      username: f.username.trim(),
      gender: f.gender,
      email: f.email.trim().toLowerCase(),
      mobileNumber: f.mobileNumber.trim(),
      alternateMobile: f.alternateMobile.trim(),
      homeAddress: f.homeAddress.trim(),
      officeAddress: f.officeAddress.trim(),
      state: f.state.trim(),
      district: f.district.trim(),
      assembly: f.assembly.trim(),
      ward: f.ward.trim(),
      pincode: f.pincode.trim(),
      familyCount: f.familyCount,
      children: toList(f.children).join(','),
      interests: toList(f.interests).join(','),
      hobbies: toList(f.hobbies).join(','),
      selectedBusinessVertical: f.selectedBusinessVertical.trim(),
      hasBusiness: f.hasBusiness,
      businessDetails: f.hasBusiness
        ? businessToJson(
          this.business,
          this.products,
          this.runsEvents ? this.expo : null,
          this.user()?.profile?.businessDetails,
          { logoFileName, productFileNames },
        )
        : null,
    };

    this.saving.set(true);
    this.formError.set(null);

    this.profileService.createUserProfile(payload, { profileImage: this.profileImageFile, businessImages }).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response?.success === false) {
          this.formError.set(response.message || 'Unable to save your profile.');
          return;
        }
        this.toast.show('Profile saved', 'Your details are up to date.', 'ok');
        void this.router.navigateByUrl('/tabs/profile-details');
      },
      error: (error: HttpErrorResponse) => {
        this.saving.set(false);
        const message = error.error?.message;
        this.formError.set(
          (Array.isArray(message) ? message.join(' ') : message) || 'Unable to save your profile. Please try again.'
        );
      },
    });
  }

  private validate(): { segment: Segment; message: string } | null {
    const f = this.personal;
    const personal = (message: string) => ({ segment: 'personal' as const, message });

    if (!f.username.trim()) return personal('Enter a username.');
    if (!f.gender) return personal('Select your gender.');
    if (!EMAIL_PATTERN.test(f.email.trim())) return personal('Enter a valid email address.');
    if (!MOBILE_PATTERN.test(f.mobileNumber.trim())) return personal('Enter a valid 10-digit mobile number.');
    if (f.alternateMobile.trim() && !MOBILE_PATTERN.test(f.alternateMobile.trim())) return personal('Enter a valid alternate mobile number.');
    if (!f.homeAddress.trim()) return personal('Enter your home address.');
    if (!f.state.trim() || !f.district.trim()) return personal('Enter your state and district.');
    if (!PINCODE_PATTERN.test(f.pincode.trim())) return personal('Enter a valid 6-digit pincode.');
    if (f.familyCount !== null && (f.familyCount < 0 || !Number.isInteger(Number(f.familyCount)))) return personal('Family count must be a whole number.');

    if (!f.hasBusiness) return null;

    const b = this.business;
    const business = (message: string) => ({ segment: 'business' as const, message });
    if (!b.businessName.trim()) return business('Enter your business name.');
    if (!b.sector.trim() || !b.businessType.trim()) return business('Enter your business sector and type.');
    if (b.gstNumber.trim() && !GST_PATTERN.test(b.gstNumber.trim().toUpperCase())) return business('Enter a valid 15-character GST number.');
    if (b.email.trim() && !EMAIL_PATTERN.test(b.email.trim())) return business('Enter a valid business email.');
    if (b.prEmail.trim() && !EMAIL_PATTERN.test(b.prEmail.trim())) return business('Enter a valid PR email.');
    if (b.businessMobile.trim() && !MOBILE_PATTERN.test(b.businessMobile.trim())) return business('Enter a valid business mobile number.');
    if (b.pincode.trim() && !PINCODE_PATTERN.test(b.pincode.trim())) return business('Enter a valid 6-digit business pincode.');
    if (b.establishedYear !== null && (b.establishedYear < 1800 || b.establishedYear > new Date().getFullYear())) {
      return business('Enter a valid established year.');
    }

    const unnamed = this.products.findIndex((product) =>
      !product.name.trim() && (product.description.trim() || product.price !== null || product.files.length)
    );
    if (unnamed >= 0) return { segment: 'products', message: `Enter a name for product ${unnamed + 1}.` };

    if (this.runsEvents) {
      const event = (message: string) => ({ segment: 'event' as const, message });
      if (!this.expo.eventName.trim()) return event('Enter the event name.');
      if (this.expo.startDate && this.expo.endDate && this.eventDays() === null) return event('The end date must be on or after the start date.');
      if (this.expo.gstPercent !== null && (this.expo.gstPercent < 0 || this.expo.gstPercent > 100)) return event('GST % must be between 0 and 100.');
    }
    return null;
  }

  // ---------------------------------------------------------------- helpers

  private emptyPersonal(): PersonalForm {
    return {
      username: '', gender: '', email: '', mobileNumber: '', alternateMobile: '', homeAddress: '', officeAddress: '',
      state: '', district: '', assembly: '', ward: '', pincode: '', familyCount: null, children: '', interests: '',
      hobbies: '', selectedBusinessVertical: '', hasBusiness: true,
    };
  }

  private revoke(url: string | null | undefined): void {
    if (url) URL.revokeObjectURL(url);
  }

  private releasePreviews(): void {
    this.revoke(this.profileImagePreview);
    this.revoke(this.logoPreview);
    this.galleryPreviews.forEach((url) => this.revoke(url));
    this.products.forEach((product) => product.previews.forEach((url) => this.revoke(url)));
    this.profileImagePreview = null;
    this.logoPreview = null;
    this.galleryPreviews = [];
  }
}
