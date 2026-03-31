import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Category } from '../models/category.model';
import type { Product } from '../models/product.model';
import type { PaginatedResponse, Review } from '../models/review.model';
import { ApiService } from './api.service';

export interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = inject(ApiService);

  getProductById(id: string): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  getCategories(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  getReviews(
    productId: string,
    query: { page?: number; limit?: number } = {},
  ): Observable<PaginatedResponse<Review>> {
    return this.api.get<PaginatedResponse<Review>>(`/reviews/${productId}`, {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 5,
      },
    });
  }
}
