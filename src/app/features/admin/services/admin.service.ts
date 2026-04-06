import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { User, Role } from '../../../core/models/user.model';
import type { Order, OrderStatus } from '../../../core/models/order.model';
import type { Product } from '../../../core/models/product.model';
import type { Category } from '../../../core/models/category.model';
import type { PendingSeller } from '../../../core/models/seller-admin.model';

export interface AdminListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  active?: boolean | 'true' | 'false';
}

export interface AdminListUsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ManageUserBody {
  role?: Role;
  active?: boolean;
}

export interface AdminListOrdersParams {
  page?: number;
  limit?: number;
  userId?: string;
  status?: OrderStatus;
}

export interface AdminListOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateOrderStatusResponse {
  id: string;
  status: OrderStatus;
  updatedAt: string;
}

export interface AdminListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export interface AdminListProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminListSellersParams {
  page?: number;
  limit?: number;
}

export interface AdminListSellersResponse {
  data: PendingSeller[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApproveSellerResponse {
  id: string;
  userId: string;
  status: string;
  approvedAt: string;
}

export interface RejectSellerResponse {
  id: string;
  userId: string;
  status: string;
  rejectedAt: string;
}

export type RevenueAnalyticsPeriod = '12m' | '7d';

export interface RevenueAnalyticsPoint {
  key: string;
  label: string;
  revenue: number;
}

export interface RevenueAnalyticsResponse {
  period: RevenueAnalyticsPeriod;
  currency: string;
  totalRevenue: number;
  data: RevenueAnalyticsPoint[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  // ── Users ──

  listUsers(params: AdminListUsersParams = {}): Observable<AdminListUsersResponse> {
    const q: Record<string, string | number | boolean> = {};
    if (params.page != null) q['page'] = params.page;
    if (params.limit != null) q['limit'] = params.limit;
    if (params.search) q['search'] = params.search;
    if (params.role != null) q['role'] = params.role;
    if (params.active !== undefined) {
      q['active'] =
        params.active === 'true' ||
        params.active === true;
    }
    return this.api.get<AdminListUsersResponse>('/admin/users', {
      params: q as Record<string, string | number | boolean>,
    });
  }

  getUser(id: string): Observable<User> {
    return this.api.get<User>(`/admin/users/${id}`);
  }

  manageUser(id: string, body: ManageUserBody): Observable<User> {
    return this.api.patch<User>(`/admin/users/${id}`, body);
  }

  verifyUser(id: string): Observable<User> {
    return this.api.patch<User>(`/admin/users/${id}/verify`, {});
  }

  // ── Orders ──

  listOrders(params: AdminListOrdersParams = {}): Observable<AdminListOrdersResponse> {
    const q: Record<string, string | number | boolean> = {};
    if (params.page != null) q['page'] = params.page;
    if (params.limit != null) q['limit'] = params.limit;
    if (params.userId) q['userId'] = params.userId;
    if (params.status) q['status'] = params.status;
    return this.api.get<AdminListOrdersResponse>('/admin/orders', { params: q });
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<UpdateOrderStatusResponse> {
    return this.api.patch<UpdateOrderStatusResponse>(`/admin/orders/${id}/status`, { status });
  }

  // ── Categories ──

  listCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  createCategory(body: { name: string; slug: string; parentId?: string | null }): Observable<Category> {
    return this.api.post<Category>('/categories', body);
  }

  updateCategory(id: string, body: { name?: string; slug?: string; parentId?: string | null }): Observable<Category> {
    return this.api.patch<Category>(`/categories/${id}`, body);
  }

  deleteCategory(id: string): Observable<unknown> {
    return this.api.delete(`/categories/${id}`);
  }

  // ── Products ──

  listProducts(params: AdminListProductsParams = {}): Observable<AdminListProductsResponse> {
    const q: Record<string, string | number | boolean> = {};
    if (params.page != null) q['page'] = params.page;
    if (params.limit != null) q['limit'] = params.limit;
    if (params.search) q['search'] = params.search;
    if (params.categoryId) q['categoryId'] = params.categoryId;
    if (params.sort) q['sort'] = params.sort;
    return this.api.get<AdminListProductsResponse>('/products', { params: q });
  }

  deleteProduct(id: string): Observable<unknown> {
    return this.api.delete(`/products/${id}`);
  }

  // ── Sellers ──

  listPendingSellers(params: AdminListSellersParams = {}): Observable<AdminListSellersResponse> {
    const q: Record<string, string | number | boolean> = {};
    if (params.page != null) q['page'] = params.page;
    if (params.limit != null) q['limit'] = params.limit;
    return this.api.get<AdminListSellersResponse>('/admin/sellers/pending', { params: q });
  }

  approveSellerStore(id: string): Observable<ApproveSellerResponse> {
    return this.api.patch<ApproveSellerResponse>(`/admin/sellers/${id}/approve`, {});
  }

  rejectSellerStore(id: string): Observable<RejectSellerResponse> {
    return this.api.patch<RejectSellerResponse>(`/admin/sellers/${id}/reject`, {});
  }

  getRevenueAnalytics(
    period: RevenueAnalyticsPeriod,
  ): Observable<RevenueAnalyticsResponse> {
    return this.api.get<RevenueAnalyticsResponse>('/admin/analytics/revenue', {
      params: { period },
    });
  }
}
