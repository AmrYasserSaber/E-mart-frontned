import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-confirmation-step',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  templateUrl: './confirmation-step.html',
  styleUrl: './confirmation-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationStep {
  private readonly checkoutService = inject(CheckoutService);

  readonly orderId = this.checkoutService.orderId;
  readonly shippingAddress = this.checkoutService.shippingAddress;

  readonly deliveryDate = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  });

  newShopping(): void {
    this.checkoutService.reset();
  }
}
