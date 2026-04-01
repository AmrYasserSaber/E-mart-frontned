import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { ShippingAddress } from './order.service';

export interface AddressResponse {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  phone: string | null;
  label: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly api = inject(ApiService);

  createAddress(address: ShippingAddress): Observable<AddressResponse> {
    return this.api.post<AddressResponse>('/addresses', {
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
    });
  }
}
