import { Injectable, signal, computed } from '@angular/core';
import { ShippingAddress } from './order.service';

export enum CheckoutStep {
  ADDRESS = 1,
  PAYMENT = 2,
  CONFIRMATION = 3,
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private readonly _currentStep = signal<CheckoutStep>(CheckoutStep.ADDRESS);
  readonly currentStep = computed(() => this._currentStep());

  private readonly _shippingAddress = signal<ShippingAddress | null>(null);
  readonly shippingAddress = computed(() => this._shippingAddress());

  private readonly _orderId = signal<string | null>(null);
  readonly orderId = computed(() => this._orderId());

  setStep(step: CheckoutStep): void {
    this._currentStep.set(step);
  }

  setShippingAddress(address: ShippingAddress): void {
    this._shippingAddress.set(address);
  }

  setOrderId(id: string): void {
    this._orderId.set(id);
  }

  reset(): void {
    this._currentStep.set(CheckoutStep.ADDRESS);
    this._shippingAddress.set(null);
    this._orderId.set(null);
  }
}
