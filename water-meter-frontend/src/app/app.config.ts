import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
// Import provideHttpClient and withInterceptorsFromDi (if you still use class-based interceptors)
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { httpInterceptProviders } from '../http-interceptors'; // Your interceptor providers

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // <--- THIS IS THE KEY LINE FOR HTTPCLIENT
    // If you're not using class-based interceptors from httpInterceptProviders anymore,
    // and instead writing functional interceptors, the (withInterceptorsFromDi()) part
    // might change. For now, assuming httpInterceptProviders has your AuthHeaderIneterceptor.
    ...httpInterceptProviders // Your existing interceptor providers
  ]
};
