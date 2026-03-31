import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AsyncPipe } from '@angular/common';
import { selectCartItems, selectCartTotal, selectCartLoading, selectCartCount } from '../../../shared/store/cart/cart.selectors';
import { CartActions } from '../../../shared/store/cart/cart.actions';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { Observable, map } from 'rxjs';
import { CartItem } from '../../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, AsyncPipe, CurrencyFormatPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit {
  private readonly store = inject(Store);

  readonly items$: Observable<CartItem[]> = this.store.select(selectCartItems);
  readonly subtotal$: Observable<number> = this.store.select(selectCartTotal);
  readonly loading$: Observable<boolean> = this.store.select(selectCartLoading);
  readonly count$: Observable<number> = this.store.select(selectCartCount);

  // Computed values
  readonly shipping$: Observable<number> = this.items$.pipe(map(items => items.length > 0 ? 8.00 : 0));
  readonly tax$: Observable<number> = this.subtotal$.pipe(map(subtotal => subtotal * 0.08));
  readonly total$: Observable<number> = this.subtotal$.pipe(
    map(subtotal => {
      const shipping = subtotal > 0 ? 8.00 : 0;
      const tax = subtotal * 0.08;
      return subtotal + shipping + tax;
    })
  );

  ngOnInit(): void {
    this.store.dispatch(CartActions.loadCart());
  }

  updateQuantity(itemId: string, current: number, delta: number): void {
    const next = current + delta;
    if (next < 1) {
      this.removeItem(itemId);
      return;
    }
    this.store.dispatch(CartActions.updateQuantity({ itemId, quantity: next }));
  }

  removeItem(itemId: string): void {
    this.store.dispatch(CartActions.removeFromCart({ itemId }));
  }

  trackById(index: number, item: any): string {
    return item.id;
  }
}
