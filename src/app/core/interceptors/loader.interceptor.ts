import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoaderService } from '@core/services/loader.service';

/**
 * Opt a request out of the global loader, e.g. for background polling:
 * `http.get(url, { context: new HttpContext().set(SKIP_GLOBAL_LOADER, true) })`
 */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const loaderInterceptor: HttpInterceptorFn = (request, next) => {
  if (request.context.get(SKIP_GLOBAL_LOADER)) {
    return next(request);
  }

  const loader = inject(LoaderService);
  loader.show();

  return next(request).pipe(finalize(() => loader.hide()));
};
