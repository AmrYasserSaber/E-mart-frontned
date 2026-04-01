import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface CreatePaymentResponse {
	message: string;
	paymentUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
	private readonly api = inject(ApiService);

	createPayment(
		orderId: string,
		paymentMethod: 'KASHIER' | 'CASH_ON_DELIVERY',
	): Observable<CreatePaymentResponse> {
		return this.api.post<CreatePaymentResponse>('/payments', {
			orderId,
			paymentMethod,
		});
	}
}
