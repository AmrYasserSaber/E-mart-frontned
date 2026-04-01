import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [],
  templateUrl: './payment-step.html',
  styleUrl: './payment-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStep {
  private readonly checkoutService = inject(CheckoutService);
  private readonly orderService = inject(OrderService);

  readonly loading = signal(false);

  completePurchase(): void {
    const address = this.checkoutService.shippingAddress();
    if (!address) {
      this.checkoutService.setStep(CheckoutStep.ADDRESS);
      return;
    }

    this.loading.set(true);
    this.orderService.placeOrder(address)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.checkoutService.setOrderId(res.id);
          this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
        },
        error: (err) => {
          console.error('Order failed', err);
          // Handle error (e.g. show toast)
        }
      });
  }

  back(): void {
    this.checkoutService.setStep(CheckoutStep.ADDRESS);
  }
}
