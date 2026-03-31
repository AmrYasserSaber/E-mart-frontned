import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCartItems, selectCartTotal } from '../../../../shared/store/cart/cart.selectors';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { Observable, map } from 'rxjs';
import { CartItem } from '../../../../core/models/cart.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [AsyncPipe, CurrencyFormatPipe],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummary {
  private readonly store = inject(Store);

  readonly items$: Observable<CartItem[]> = this.store.select(selectCartItems);
  readonly subtotal$: Observable<number> = this.store.select(selectCartTotal);
  
  // For simplicity, using same calculations as in Cart view
  readonly shipping$: Observable<number> = this.items$.pipe(map(items => items.length > 0 ? 8.00 : 0));
  readonly tax$: Observable<number> = this.subtotal$.pipe(map(subtotal => subtotal * 0.08));
  readonly total$: Observable<number> = this.subtotal$.pipe(
    map(subtotal => {
      const shipping = subtotal > 0 ? 8.00 : 0;
      const tax = subtotal * 0.08;
      return subtotal + shipping + tax;
    })
  );
}
