import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import type { User, Role } from '../../../core/models/user.model';

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

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

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
}
