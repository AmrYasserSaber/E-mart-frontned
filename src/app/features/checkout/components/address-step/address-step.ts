import { Component, inject, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';
import {
  AddressService,
  AddressResponse,
} from '../../services/address.service';
import { ShippingAddress } from '../../services/order.service';

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
  private readonly addressService = inject(AddressService);

  addressForm!: FormGroup;
  readonly mode = signal<'saved' | 'new'>('new');
  readonly addresses = signal<AddressResponse[]>([]);
  readonly selectedAddressId = signal<string | null>(null);
  readonly loadingSavedAddresses = signal(false);
  readonly selectionError = signal('');

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

    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.loadingSavedAddresses.set(true);

    this.addressService.getAddresses().subscribe({
      next: ({ data }) => {
        this.addresses.set(data);
        this.loadingSavedAddresses.set(false);

        const existingAddressId = this.checkoutService.addressId();
        if (existingAddressId && data.some((address) => address.id === existingAddressId)) {
          this.mode.set('saved');
          this.selectedAddressId.set(existingAddressId);
          return;
        }

        if (data.length > 0 && !this.checkoutService.shippingAddress()) {
          const primary = data.find((address) => address.isPrimary) ?? data[0];
          this.mode.set('saved');
          this.selectedAddressId.set(primary.id);
        }
      },
      error: () => {
        this.loadingSavedAddresses.set(false);
      },
    });
  }

  useSavedAddress(): void {
    this.mode.set('saved');
    this.selectionError.set('');

    if (!this.selectedAddressId() && this.addresses().length > 0) {
      const primary = this.addresses().find((address) => address.isPrimary) ?? this.addresses()[0];
      this.selectedAddressId.set(primary.id);
    }
  }

  useNewAddress(): void {
    this.mode.set('new');
    this.selectionError.set('');
    this.checkoutService.clearAddressId();
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
    this.selectionError.set('');
  }

  private mapAddressToShipping(address: AddressResponse): ShippingAddress {
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      zip: '',
      country: 'United States',
    };
  }

  next(): void {
    if (this.mode() === 'saved') {
      const selectedId = this.selectedAddressId();
      if (!selectedId) {
        this.selectionError.set('Please choose one of your saved addresses.');
        return;
      }

      const selected = this.addresses().find((address) => address.id === selectedId);
      if (!selected) {
        this.selectionError.set('Selected address is no longer available. Please choose another one.');
        return;
      }

      this.checkoutService.setAddressId(selected.id);
      this.checkoutService.setShippingAddress(this.mapAddressToShipping(selected));
      this.checkoutService.setStep(CheckoutStep.PAYMENT);
      return;
    }

    if (this.addressForm.valid) {
      this.checkoutService.clearAddressId();
      this.checkoutService.setShippingAddress(this.addressForm.value);
      this.checkoutService.setStep(CheckoutStep.PAYMENT);
    } else {
      this.addressForm.markAllAsTouched();
    }
  }
}
