import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';

@Component({
  selector: 'app-address-step',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './address-step.html',
  styleUrl: './address-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressStep implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);

  addressForm!: FormGroup;

  ngOnInit(): void {
    const existing = this.checkoutService.shippingAddress();
    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required]], // Not in backend schema but in UI
      lastName: ['', [Validators.required]],  // Not in backend schema but in UI
      street: [existing?.street || '', [Validators.required]],
      city: [existing?.city || '', [Validators.required]],
      zip: [existing?.zip || '', [Validators.required]],
      country: [existing?.country || 'United States', [Validators.required]],
    });
  }

  next(): void {
    if (this.addressForm.valid) {
      this.checkoutService.setShippingAddress(this.addressForm.value);
      this.checkoutService.setStep(CheckoutStep.PAYMENT);
    } else {
      this.addressForm.markAllAsTouched();
    }
  }
}
