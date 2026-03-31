import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
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
export class CheckoutComponent {
  private readonly checkoutService = inject(CheckoutService);

  readonly currentStep = this.checkoutService.currentStep;
  readonly STEP = CheckoutStep;
}
