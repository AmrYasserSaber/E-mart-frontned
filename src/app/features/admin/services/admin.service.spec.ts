import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { AdminService } from './admin.service';

describe('AdminService sellers API', () => {
  it('calls approve seller endpoint', () => {
    const api = {
      patch: vi.fn().mockReturnValue(of({
        id: 'seller-1',
        userId: 'user-1',
        status: 'approved',
        approvedAt: new Date().toISOString(),
      })),
    };

    const service = Object.create(AdminService.prototype) as AdminService;
    (service as unknown as { api: typeof api }).api = api;

    service.approveSellerStore('seller-1').subscribe();

    expect(api.patch).toHaveBeenCalledWith('/admin/sellers/seller-1/approve', {});
  });

  it('calls reject seller endpoint', () => {
    const api = {
      patch: vi.fn().mockReturnValue(of({
        id: 'seller-1',
        userId: 'user-1',
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
      })),
    };

    const service = Object.create(AdminService.prototype) as AdminService;
    (service as unknown as { api: typeof api }).api = api;

    service.rejectSellerStore('seller-1').subscribe();

    expect(api.patch).toHaveBeenCalledWith('/admin/sellers/seller-1/reject', {});
  });

  it('passes page and limit to pending sellers endpoint', () => {
    const api = {
      get: vi.fn().mockReturnValue(of({ data: [], total: 0, page: 2, limit: 20, totalPages: 0 })),
    };

    const service = Object.create(AdminService.prototype) as AdminService;
    (service as unknown as { api: typeof api }).api = api;

    service.listPendingSellers({ page: 2, limit: 20 }).subscribe();

    expect(api.get).toHaveBeenCalledWith('/admin/sellers/pending', {
      params: { page: 2, limit: 20 },
    });
  });
});
