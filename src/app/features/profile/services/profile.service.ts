import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type {
  AccountStats,
  Address,
  PaymentMethod,
  RecentOrder,
  UpdateProfileRequest,
  UserProfile,
} from '../models/profile.models';

const STUB_DELAY = 400;

const STUB_PROFILE: UserProfile = {
  id: '1',
  firstName: 'Elena',
  lastName: 'Richardson',
  email: 'elena.richardson@emart.io',
  phone: '+1 (555) 234-5678',
  bio: 'Artisanal goods curator and tech enthusiast. Looking for the best organic finds.',
  avatarUrl: null,
  isVerified: true,
  membershipTier: 'E-Mart Pro Member',
  memberSince: 2022,
  createdAt: '2022-03-15T00:00:00Z',
};

const STUB_STATS: AccountStats = {
  totalOrders: 24,
  wishlistCount: 12,
};

const STUB_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', brand: 'Visa', last4: '4242', expiryMonth: 12, expiryYear: 2026 },
];

const STUB_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Main Residence',
    icon: 'home',
    street: '128 Editorial Lane, Suite 4B',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
    country: 'United States',
    phone: '+1 (555) 012-3456',
    isPrimary: true,
  },
  {
    id: '2',
    label: 'Work Office',
    icon: 'work',
    street: '1200 Innovation Way, Suite 400',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    country: 'United States',
    phone: '+1 (555) 987-6543',
    isPrimary: false,
  },
];

const STUB_RECENT_ORDERS: RecentOrder[] = [
  {
    id: '1',
    orderNumber: 'EM-99281',
    status: 'shipped',
    estimatedDelivery: 'Oct 24, 2024',
    deliveredAt: null,
    shippingType: 'Priority Shipping',
    productImages: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBO1JxFL7-lbbGTjlP_Um3kZZP1NXwn2yDeDJueGcl5sTBXXeehsWboIzA-g9T8GebinH08948V8vmS3gBt4fXpSmLvC7xPVyaRr22pyw71WgXgXGdP6fLoqCBpU3kzd2o6bcbOh8MQq1G3Qb5pIR182Y0YUfDosm4MFb94iC3PLBwO_VAZmQye8jXvrdEyigCUbGNWkB_0t681qCuqPYPKvq8HFlcjNhaHzNP-nMAvXFlHitoUYZZwy3QIos3RJmtADNLgCL9kV2s',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClPMlkwl7umZTz7kk3uaSahg7GRcESnQSEvpTCiQWzquxgam9G088p8bHh0j_NyCbEAV7Sb78uFLYqXQzSeUywwcVhzetxT5lV3eKInrIciP0fM0ffSQtLN39RyA3e3-CotLJ1XMXsWSsoZENyxunxwWf7F-nF1YL_Nl_-05uFTCyBOu9n5Ct5z1QhKgstIP1W71mPg3jXK4kvPTp-oclvxTIA6KQEQGrzZ--t2eYsEqIqmA192vPkgnatyM8S3quZveaNh0cU2E0',
    ],
    createdAt: '2024-10-20T00:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'EM-88120',
    status: 'delivered',
    estimatedDelivery: null,
    deliveredAt: 'Oct 12, 2024',
    shippingType: null,
    productImages: [],
    createdAt: '2024-10-05T00:00:00Z',
  },
];

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly api: ApiService) {}

  // TODO: Replace stubs with real API calls

  getProfile(): Observable<UserProfile> {
    // return this.api.get<UserProfile>('/profile');
    return of(STUB_PROFILE).pipe(delay(STUB_DELAY));
  }

  getAccountStats(): Observable<AccountStats> {
    // return this.api.get<AccountStats>('/profile/stats');
    return of(STUB_STATS).pipe(delay(STUB_DELAY));
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    // return this.api.get<PaymentMethod[]>('/profile/payment-methods');
    return of(STUB_PAYMENT_METHODS).pipe(delay(STUB_DELAY));
  }

  getPrimaryAddress(): Observable<Address | null> {
    // return this.api.get<Address>('/profile/addresses/primary');
    const primary = STUB_ADDRESSES.find((a) => a.isPrimary) ?? null;
    return of(primary).pipe(delay(STUB_DELAY));
  }

  getAddresses(): Observable<Address[]> {
    // return this.api.get<Address[]>('/profile/addresses');
    return of(STUB_ADDRESSES).pipe(delay(STUB_DELAY));
  }

  deleteAddress(id: string): Observable<void> {
    // return this.api.delete<void>(`/profile/addresses/${id}`);
    return of(undefined).pipe(delay(STUB_DELAY));
  }

  getRecentOrders(): Observable<RecentOrder[]> {
    // return this.api.get<RecentOrder[]>('/profile/orders/recent');
    return of(STUB_RECENT_ORDERS).pipe(delay(STUB_DELAY));
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    // return this.api.patch<UserProfile>('/profile', data);
    return of({ ...STUB_PROFILE, ...data }).pipe(delay(STUB_DELAY));
  }
}
