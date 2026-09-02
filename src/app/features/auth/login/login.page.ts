import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  submitting = false;
  errorMessage = '';

  submit(): void {
    if (this.submitting || !this.email.trim() || !this.password) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth.login({ email: this.email.trim(), password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/tabs/dashboard';
        this.router.navigateByUrl(returnUrl.startsWith('/') ? returnUrl : '/tabs/dashboard');
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        this.errorMessage = error.error?.message ?? 'Unable to sign in. Check your details and try again.';
      },
    });
  }
}