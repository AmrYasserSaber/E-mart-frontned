import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CheckoutService, CheckoutStep } from '../../services/checkout.service';
import { OrderService } from '../../services/order.service';
import { PaymentMethodService, UserCard } from '../../services/payment-method.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payment-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-step.html',
  styleUrl: './payment-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStep implements OnInit {
  private readonly checkoutService = inject(CheckoutService);
  private readonly orderService = inject(OrderService);
  private readonly paymentMethodService = inject(PaymentMethodService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly savedCards = signal<UserCard[]>([]);
  readonly selectedMethod = signal<string>('cod'); // 'cod' or card ID
  readonly showAddCardForm = signal(false);
  readonly cardSaving = signal(false);

  readonly addCardForm: FormGroup = this.fb.group({
    cardholderName: ['', [Validators.required, Validators.minLength(2)]],
    cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
    expiryMonth: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
    expiryYear: [new Date().getFullYear(), [Validators.required, Validators.min(new Date().getFullYear())]],
    cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
  });

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards(): void {
    this.paymentMethodService.listCards().subscribe({
      next: (cards) => this.savedCards.set(cards),
      error: (err) => console.error('Failed to load cards', err),
    });
  }

  selectMethod(methodId: string): void {
    this.selectedMethod.set(methodId);
  }

  toggleAddCardForm(): void {
    this.showAddCardForm.update(v => !v);
    if (!this.showAddCardForm()) {
      this.addCardForm.reset({ expiryYear: new Date().getFullYear() });
    }
  }

  saveNewCard(): void {
    if (this.addCardForm.invalid) return;

    this.cardSaving.set(true);
    this.paymentMethodService.saveCard(this.addCardForm.value)
      .pipe(finalize(() => this.cardSaving.set(false)))
      .subscribe({
        next: (card) => {
          this.savedCards.update(cards => [card, ...cards]);
          this.selectedMethod.set(card.id);
          this.toggleAddCardForm();
        },
        error: (err) => console.error('Failed to save card', err),
      });
  }

  completePurchase(): void {
    const address = this.checkoutService.shippingAddress();
    if (!address) {
      this.checkoutService.setStep(CheckoutStep.ADDRESS);
      return;
    }

    const method = this.selectedMethod();
    const paymentMethodName = method === 'cod' ? 'Cash on Delivery' : 'Credit Card';

    this.loading.set(true);
    this.orderService.placeOrder(address, paymentMethodName)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.checkoutService.setOrderId(res.id);
          this.checkoutService.setStep(CheckoutStep.CONFIRMATION);
        },
        error: (err) => console.error('Order failed', err),
      });
  }

  back(): void {
    this.checkoutService.setStep(CheckoutStep.ADDRESS);
  }
}
