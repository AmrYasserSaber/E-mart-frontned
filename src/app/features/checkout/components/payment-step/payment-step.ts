import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { PaymentService } from '../../services/payment.service';

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
  private readonly addressService = inject(AddressService);
  private readonly paymentService = inject(PaymentService);

  readonly loading = signal(false);
  readonly selectedMethod = signal<'KASHIER' | 'CASH_ON_DELIVERY'>(
    this.checkoutService.paymentMethod(),
  );

  selectMethod(method: 'KASHIER' | 'CASH_ON_DELIVERY'): void {
    this.selectedMethod.set(method);
    this.checkoutService.setPaymentMethod(method);
  }

  completePurchase(): void {
    const address = this.checkoutService.shippingAddress();
    if (!address) {
      this.checkoutService.setStep(CheckoutStep.ADDRESS);
      return;
    }

    this.loading.set(true);
    const paymentMethod = this.selectedMethod();
    const existingAddressId = this.checkoutService.addressId();

    const proceedWithOrder = (addressId: string) => {
      this.orderService.placeOrder(addressId, paymentMethod).subscribe({
        next: (order) => {
          this.checkoutService.setOrderId(order.id);
          this.paymentService.createPayment(order.id, paymentMethod).subscribe({
            next: (payment) => {
              if (paymentMethod === 'KASHIER' && payment.paymentUrl) {
                this.loading.set(false);
                sessionStorage.setItem('checkout_order_id', order.id);
                window.location.href = payment.paymentUrl;
                return;
              }
              this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
              this.loading.set(false);
            },
            error: (err) => {
              this.loading.set(false);
              console.error('Payment initialization failed', err);
            },
          });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Order failed', err);
        },
      });
    };

    if (existingAddressId) {
      proceedWithOrder(existingAddressId);
      return;
    }

    this.addressService
      .createAddress(address)
      .subscribe({
        next: (savedAddress) => {
          this.checkoutService.setAddressId(savedAddress.id);
          proceedWithOrder(savedAddress.id);
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Address save failed', err);
        },
      });
  }

  back(): void {
    this.checkoutService.setStep(CheckoutStep.ADDRESS);
  }
}
