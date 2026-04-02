
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
  private readonly uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  readonly currentStep = this.checkoutService.currentStep;
  readonly STEP = CheckoutStep;

  private isPaidOrder(order: any): boolean {
    const status = String(order?.payment?.status ?? '').toLowerCase();
    return status === 'paid' || status === 'success';
  }

  private isUuid(value: string | null | undefined): value is string {
    return Boolean(value && this.uuidPattern.test(value));
  }

  private isSuccessfulReturn(): boolean {
    const status =
      this.route.snapshot.queryParamMap.get('paymentStatus') ??
      this.route.snapshot.queryParamMap.get('status') ??
      this.route.snapshot.queryParamMap.get('payment_status');

    if (!status) return false;

    const normalized = status.trim().toLowerCase();
    return normalized === 'success' || normalized === 'paid';
  }

  private getOrderCandidates(): string[] {
    const query = this.route.snapshot.queryParamMap;
    const allOrderIds = query.getAll('orderId');
    const allSnakeOrderIds = query.getAll('order_id');
    const allOrderAliases = query.getAll('order');
    const queryCandidates = [
      query.get('merchantOrderId'),
      query.get('merchant_order_id'),
      query.get('merchantOrder'),
      ...allOrderIds,
      ...allSnakeOrderIds,
      ...allOrderAliases,
      query.get('reference'),
      query.get('orderReference'),
    ].filter((value): value is string => this.isUuid(value));

    const sessionOrderId = sessionStorage.getItem('checkout_order_id');
    const storedCandidate = this.isUuid(sessionOrderId) ? [sessionOrderId] : [];

    return [...new Set([...queryCandidates, ...storedCandidate])];
  }

  private async hydrateOrderFromReturn(
    orderIds: string[],
    fallbackToPayment = true,
  ): Promise<void> {
    for (const orderId of orderIds) {
      try {
        const order = await firstValueFrom(
          this.orderService.getOrderDetails(orderId, true),
        );
        if (!this.isPaidOrder(order)) {
          continue;
        }

        this.checkoutService.setOrderId(orderId);
        this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
        sessionStorage.setItem('checkout_order_id', orderId);
        return;
      } catch {
        continue;
      }
    }

    if (fallbackToPayment) {
      this.checkoutService.setStep(CheckoutStep.PAYMENT);
    }
  }

  ngOnInit(): void {
    const orderCandidates = this.getOrderCandidates();
    if (orderCandidates.length > 0) {
      const successfulReturn = this.isSuccessfulReturn();

      if (successfulReturn) {
        const preferredOrderId = orderCandidates[0];
        this.checkoutService.setOrderId(preferredOrderId);
        this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
        sessionStorage.setItem('checkout_order_id', preferredOrderId);
        void this.hydrateOrderFromReturn([preferredOrderId], false);
        return;
      }

      void this.hydrateOrderFromReturn(orderCandidates, !successfulReturn);
    }
  }
}
