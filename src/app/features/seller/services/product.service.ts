import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { StorageService } from '../../../core/services/storage.service';
import { Role } from '../../../core/models/user.model';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface SellerProduct {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  featured?: boolean;
  images: string[];
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
}

export interface ProductsResponse {
  data: SellerProduct[];
  total: number;
  page: number;
  pages?: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export interface ProductPayload {
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: File[];
  featured?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(StorageService);

  private get isAdminContext(): boolean {
    return this.storage.getUser()?.role === Role.ADMIN;
  }

  private toFormData(payload: ProductPayload): FormData {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('price', String(payload.price));
    formData.append('stock', String(payload.stock));
    formData.append('categoryId', payload.categoryId);
    if (payload.featured !== undefined) {
      formData.append('featured', String(payload.featured));
    }

    for (const file of payload.images) {
      formData.append('images', file, file.name);
    }

    return formData;
  }

  listProducts(query: ProductQuery = {}): Observable<ProductsResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (query.page) params['page'] = query.page;
    if (query.limit) params['limit'] = query.limit;
    if (query.categoryId) params['categoryId'] = query.categoryId;
    if (query.search) params['search'] = query.search;
    if (query.sort) params['sort'] = query.sort;

    const endpoint = this.isAdminContext ? '/products' : '/sellers/me/products';
    return this.api.get<ProductsResponse>(endpoint, { params });
  }

  getProduct(id: string): Observable<SellerProduct> {
    const endpoint = this.isAdminContext ? `/products/${id}` : `/sellers/me/products/${id}`;
    return this.api.get<SellerProduct>(endpoint);
  }

  createProduct(payload: ProductPayload): Observable<SellerProduct> {
    const endpoint = this.isAdminContext ? '/products' : '/sellers/me/products';
    return this.api.post<SellerProduct>(endpoint, this.toFormData(payload));
  }

  updateProduct(id: string, payload: ProductPayload): Observable<SellerProduct> {
    const endpoint = this.isAdminContext ? `/products/${id}` : `/sellers/me/products/${id}`;
    return this.api.patch<SellerProduct>(endpoint, this.toFormData(payload));
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    const endpoint = this.isAdminContext ? `/products/${id}` : `/sellers/me/products/${id}`;
    return this.api.delete<{ message: string }>(endpoint);
  }

  listCategories(): Observable<ProductCategory[]> {
    return this.api.get<ProductCategory[]>('/categories');
  }
}
