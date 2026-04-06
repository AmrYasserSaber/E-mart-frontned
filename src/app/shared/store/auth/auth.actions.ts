import { createAction, props } from '@ngrx/store';
import type { User } from '../../../core/models/user.model';
import type { AuthTokensOnlyResponse, AuthTokensResponse } from '../../../core/models/user.model';

export const AuthActions = {
  hydrateFromStorage: createAction(
    '[Auth] Hydrate From Storage',
    props<{
      accessToken: string | null;
      refreshToken: string | null;
      user: User | null;
    }>(),
  ),

  login: createAction('[Auth] Login', props<{ email: string; password: string }>()),
  loginSuccess: createAction('[Auth] Login Success', props<AuthTokensOnlyResponse>()),
  loginFailure: createAction('[Auth] Login Failure', props<{ error: string }>()),

  exchangeOAuthCode: createAction('[Auth] Exchange OAuth Code', props<{ code: string }>()),
  exchangeOAuthCodeSuccess: createAction(
    '[Auth] Exchange OAuth Code Success',
    props<AuthTokensOnlyResponse>(),
  ),
  exchangeOAuthCodeFailure: createAction(
    '[Auth] Exchange OAuth Code Failure',
    props<{ error: string }>(),
  ),

  register: createAction(
    '[Auth] Register',
    props<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }>(),
  ),
  registerSuccess: createAction('[Auth] Register Success', props<AuthTokensResponse>()),
  registerFailure: createAction('[Auth] Register Failure', props<{ error: string }>()),

  loadUser: createAction('[Auth] Load User'),
  loadUserSuccess: createAction('[Auth] Load User Success', props<{ user: User }>()),
  loadUserFailure: createAction('[Auth] Load User Failure', props<{ error: string }>()),

  logout: createAction('[Auth] Logout'),
  logoutSuccess: createAction('[Auth] Logout Success'),

  clearAuthError: createAction('[Auth] Clear Error'),
};
