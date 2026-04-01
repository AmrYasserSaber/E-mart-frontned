
import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from './services/order.service';
import { CheckoutService, CheckoutStep } from './services/checkout.service';
import { StepIndicator } from './components/step-indicator/step-indicator';
import { AddressStep } from './components/address-step/address-step';
import { PaymentStep } from './components/payment-step/payment-step';
import { ConfirmationStep } from './components/confirmation-step/confirmation-step';
import { OrderSummary } from './components/order-summary/order-summary';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    StepIndicator,
    AddressStep,
    PaymentStep,
    ConfirmationStep,
    OrderSummary,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);

  readonly currentStep = this.checkoutService.currentStep;
  readonly STEP = CheckoutStep;

  private isPaidOrder(order: any): boolean {
    const status = String(order?.payment?.status ?? '').toLowerCase();
    return status === 'paid' || status === 'success';
  }

  private async hydrateOrderFromReturn(orderId: string): Promise<void> {
    try {
      const order = await firstValueFrom(this.orderService.getOrderDetails(orderId));
      if (!this.isPaidOrder(order)) {
        this.checkoutService.setStep(CheckoutStep.PAYMENT);
        return;
      }

      this.checkoutService.setOrderId(orderId);
      this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
    } catch {
      this.checkoutService.setStep(CheckoutStep.PAYMENT);
    }
  }

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const orderId =
      query.get('orderId') ||
      query.get('order_id') ||
      query.get('order') ||
      sessionStorage.getItem('checkout_order_id');

    if (orderId) {
      void this.hydrateOrderFromReturn(orderId);
    }
  }
}
