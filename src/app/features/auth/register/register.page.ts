import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@core/services/auth.service';
import { LoaderService } from '@core/services/loader.service';
import { ToastService } from '@core/services/toast.service';
import { RegisterRequest } from '@core/models/auth.models';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink, BackButtonComponent],
  templateUrl: './register.page.html',
  styleUrls: ['../login/login.page.scss', './register.page.scss'],
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  mobileNumber = '';
  homeLocation = '';
  businessLocation = '';
  latitude: number | null = null;
  longitude: number | null = null;
  hasBusiness = true;

  submitting = false;
  locating = false;
  errorMessage = '';

  get hasCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }

  detectLocation(): void {
    if (!('geolocation' in navigator)) {
      this.errorMessage = 'Location is not available on this device. Enter the coordinates manually.';
      return;
    }

    this.locating = true;
    this.errorMessage = '';
    this.loader.show('Finding your location');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = Number(position.coords.latitude.toFixed(6));
        this.longitude = Number(position.coords.longitude.toFixed(6));
        this.locating = false;
        this.loader.hide();
      },
      () => {
        this.locating = false;
        this.loader.hide();
        this.errorMessage = 'Could not read your location. Allow location access or enter the coordinates manually.';
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  private validate(): string | null {
    if (!this.name.trim()) return 'Enter your full name.';
    if (!EMAIL_PATTERN.test(this.email.trim())) return 'Enter a valid email address.';
    if (!MOBILE_PATTERN.test(this.mobileNumber.trim())) return 'Enter a valid 10-digit mobile number.';
    if (this.password.length < 6) return 'Password must be at least 6 characters.';
    if (this.password !== this.confirmPassword) return 'Passwords do not match.';
    if (!this.homeLocation.trim()) return 'Enter your home location.';
    if (this.hasBusiness && !this.businessLocation.trim()) return 'Enter your business location.';
    if (!this.hasCoordinates) return 'Add your location coordinates.';
    if (Math.abs(this.latitude!) > 90 || Math.abs(this.longitude!) > 180) return 'Location coordinates are out of range.';
    return null;
  }

  submit(): void {
    if (this.submitting) {
      return;
    }

    const invalid = this.validate();
    if (invalid) {
      this.errorMessage = invalid;
      return;
    }

    const payload: RegisterRequest = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      mobileNumber: this.mobileNumber.trim(),
      homeLocation: this.homeLocation.trim(),
      businessLocation: this.hasBusiness ? this.businessLocation.trim() : '',
      latitude: Number(this.latitude),
      longitude: Number(this.longitude),
      hasBusiness: this.hasBusiness,
    };

    this.submitting = true;
    this.errorMessage = '';

    this.auth.register(payload).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response?.success === false) {
          this.errorMessage = response.message || 'Unable to create your account.';
          return;
        }
        this.toast.show('Account created', 'Sign in with your new account to continue.', 'ok');
        this.router.navigate(['/login'], { queryParams: { email: payload.email } });
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = error.error?.message ?? 'Unable to create your account. Please try again.';
      },
    });
  }
}
