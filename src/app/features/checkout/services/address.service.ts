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

export interface AddressListResponse {
  data: AddressResponse[];
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly api = inject(ApiService);

  getAddresses(): Observable<AddressListResponse> {
    return this.api.get<AddressListResponse>('/addresses');
  }

  createAddress(address: ShippingAddress): Observable<AddressResponse> {
    return this.api.post<AddressResponse>('/addresses', {
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
    });
  }
}
