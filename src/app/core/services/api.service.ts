import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/app.tokens';
import type { ApiResponse } from '../models/api-response.model';

function toHttpParams(
  record: Record<string, string | number | boolean> | undefined,
): HttpParams | undefined {
  if (!record) return undefined;
  let p = new HttpParams();
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null || value === '') continue;
    p = p.set(key, String(value));
  }
  return p;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly baseUrl: string,
  ) {}

  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${p}`;
  }

  get<T>(
    path: string,
    options?: {
      params?: Record<string, string | number | boolean>;
      context?: HttpContext;
    },
  ): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(this.url(path), {
        params: toHttpParams(options?.params),
        context: options?.context,
      })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url(path), body, options as object)
      .pipe(map((r) => r.data));
  }

  patch<T>(path: string, body: unknown, options?: object): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.url(path), body, options as object)
      .pipe(map((r) => r.data));
  }

  delete<T>(path: string, options?: object): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(this.url(path), options as object)
      .pipe(map((r) => r.data));
  }

  deleteRaw(path: string): Observable<void> {
    return this.http.delete<void>(this.url(path));
  }

  getRaw<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path));
  }
}
