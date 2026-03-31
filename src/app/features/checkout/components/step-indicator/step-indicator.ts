import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  imports: [],
  templateUrl: './step-indicator.html',
  styleUrl: './step-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepIndicator {
  private readonly checkoutService = inject(CheckoutService);
  
  readonly currentStep = this.checkoutService.currentStep;
  readonly STEP = CheckoutStep;
}
