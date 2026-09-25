import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withPreloading, PreloadAllModules, RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';

const ionicConfig = {
  mode: 'ios' as const,
  animated: true,
  // Ionic's keyboard shims assume a 290px keyboard and scroll/pad the page on
  // every input focus, which makes the page jump. The native WebView already
  // keeps focused inputs visible, so turn them off.
  scrollAssist: false,
  scrollPadding: false,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([loaderInterceptor, authInterceptor])),
    provideIonicAngular(ionicConfig),
    importProvidersFrom(IonicModule.forRoot(ionicConfig)),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
};
