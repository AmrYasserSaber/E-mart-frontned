import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { Store } from '@ngrx/store';

import { appRoutes } from './app.routes';
import { authReducer } from './shared/store/auth/auth.reducer';
import { cartReducer } from './shared/store/cart/cart.reducer';
import { productsReducer } from './shared/store/products/products.reducer';
import { AuthEffects } from './shared/store/auth/auth.effects';
import { ProductsEffects } from './shared/store/products/products.effects';
import { AuthActions } from './shared/store/auth/auth.actions';
import { CartEffects } from './shared/store/cart/cart.effects';
import { CartActions } from './shared/store/cart/cart.actions';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authRefreshInterceptor } from './core/interceptors/auth-refresh.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { API_BASE_URL } from './core/tokens/app.tokens';
import { StorageService } from './core/services/storage.service';
import { environment } from '../environments/environment';

function authHydrateFromStorage(): void {
  try {
    const storage = inject(StorageService);
    const store = inject(Store);
    const access = storage.getAccessToken();
    const refresh = storage.getRefreshToken();
    const user = access || refresh ? storage.getUser() : null;

    store.dispatch(
      AuthActions.hydrateFromStorage({
        accessToken: access,
        refreshToken: refresh,
        user,
      }),
    );
    if (access && !user) {
      store.dispatch(AuthActions.loadUser());
    }

    if (access || refresh) {
      store.dispatch(CartActions.loadCart());
    }
  } catch {
    // Never fail bootstrap if storage or store is unavailable during init
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZonelessChangeDetection(),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    provideHttpClient(withInterceptors([authInterceptor, authRefreshInterceptor, loadingInterceptor, errorInterceptor])),
    provideRouter(appRoutes),
    provideStore({
      auth: authReducer,
      cart: cartReducer,
      products: productsReducer,
    }),
    provideEffects([AuthEffects, ProductsEffects, CartEffects]),
    ...(isDevMode()
      ? [
          provideStoreDevtools({
            maxAge: 25,
            logOnly: false,
            trace: false,
          }),
        ]
      : []),
    provideEnvironmentInitializer(authHydrateFromStorage),
  ],
};
