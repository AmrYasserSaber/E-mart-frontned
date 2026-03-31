import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<UserCard[]>(`${this.baseUrl}/payments/cards`);
  }

  saveCard(dto: SaveCardDto): Observable<UserCard> {
    return this.http.post<UserCard>(`${this.baseUrl}/payments/cards`, dto);
  }

  deleteCard(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/payments/cards/${id}/delete`, {});
  }
}
