import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';

/** Only for signed-out users: signed-in users skip straight to the dashboard. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated ? inject(Router).createUrlTree(['/tabs/dashboard']) : true;
};
