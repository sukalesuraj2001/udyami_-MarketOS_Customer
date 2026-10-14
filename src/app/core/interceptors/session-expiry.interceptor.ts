import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';

/**
 * A 401 from the backend means the token the request was sent with is dead
 * (expired or revoked), not that these particular credentials were wrong —
 * that case only ever happens while already signed in, since the login/
 * register calls never carry a token (see authInterceptor). Drop the dead
 * session and send the user straight back to the login page.
 */
export const sessionExpiryInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isAuthCall = request.url.endsWith('/auth/loginUser') || request.url.endsWith('/auth/createUser');

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        auth.isAuthenticated &&
        !isAuthCall &&
        !router.url.startsWith('/login')
      ) {
        const returnUrl = router.url;
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl } });
        void toast.show('Session expired', 'Please sign in again to continue.', 'no');
      }

      return throwError(() => error);
    }),
  );
};
