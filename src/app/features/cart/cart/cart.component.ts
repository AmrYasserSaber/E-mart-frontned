import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { selectCartItems, selectCartTotal } from '../../../shared/store/cart/cart.selectors';
import { CartActions } from '../../../shared/store/cart/cart.actions';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, AsyncPipe, CurrencyFormatPipe, EmptyState],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent {
  private readonly store = inject(Store);
  readonly items$ = this.store.select(selectCartItems);
  readonly total$ = this.store.select(selectCartTotal);

  bump(id: number, delta: number, current: number): void {
    const next = current + delta;
    if (next < 1) {
      this.remove(id);
      return;
    }
    this.store.dispatch(
      CartActions.updateQuantity({
        productId: id,
        quantity: next,
      }),
    );
  }

  remove(id: number): void {
    this.store.dispatch(CartActions.removeFromCart({ productId: id }));
  }
}
