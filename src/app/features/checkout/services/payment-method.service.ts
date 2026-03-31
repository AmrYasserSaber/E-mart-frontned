import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/app.tokens';

export interface UserCard {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface SaveCardDto {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listCards(): Observable<UserCard[]> {
    return this.http
      .get<any>(`${this.baseUrl}/payments/cards`)
      .pipe(map((res) => res.data));
  }

  saveCard(dto: SaveCardDto): Observable<UserCard> {
    return this.http
      .post<any>(`${this.baseUrl}/payments/cards`, dto)
      .pipe(map((res) => res.data));
  }

  deleteCard(id: string): Observable<void> {
    return this.http
      .post<any>(`${this.baseUrl}/payments/cards/${id}/delete`, {})
      .pipe(map((res) => res.data));
  }
}
