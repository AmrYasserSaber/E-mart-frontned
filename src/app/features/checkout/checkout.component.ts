import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CheckoutService, CheckoutStep } from './services/checkout.service';
import { StepIndicator } from './components/step-indicator/step-indicator';
import { AddressStep } from './components/address-step/address-step';
import { PaymentStep } from './components/payment-step/payment-step';
import { ConfirmationStep } from './components/confirmation-step/confirmation-step';
import { OrderSummary } from './components/order-summary/order-summary';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    RouterLink,
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

  readonly currentStep = this.checkoutService.currentStep;
  readonly STEP = CheckoutStep;

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const orderId =
      query.get('orderId') ||
      query.get('order_id') ||
      query.get('order') ||
      sessionStorage.getItem('checkout_order_id');

    if (orderId) {
      this.checkoutService.setOrderId(orderId);
      this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
    }
  }
}
