import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../shared/store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../shared/store/auth/auth.selectors';

@Component({
  selector: 'app-oauth-callback',
  imports: [CommonModule, RouterLink],
  templateUrl: './oauth-callback.component.html',
  styleUrl: './oauth-callback.component.css',
})
export class OAuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);

  readonly loading$ = this.store.select(selectAuthLoading);
  readonly error$ = this.store.select(selectAuthError);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (!code) {
      this.store.dispatch(AuthActions.loginFailure({ error: 'Missing OAuth code.' }));
      return;
    }
    this.store.dispatch(AuthActions.exchangeOAuthCode({ code }));
  }
}
