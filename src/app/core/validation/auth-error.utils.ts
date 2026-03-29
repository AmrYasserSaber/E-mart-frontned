import { HttpErrorResponse } from '@angular/common/http';
import type { ZodError } from 'zod';
import type { ApiErrorBody } from '../models/api-response.model';

export function mapZodIssuesToMessage(error: ZodError): string {
  const issues = error.issues;
  if (issues.length === 0) return 'Validation failed.';
  if (issues.length === 1) return issues[0].message;
  return issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

export function mapZodIssuesToFieldErrors(error: ZodError): Partial<Record<string, string>> {
  const result: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '_form');
    if (!result[key]) {
      result[key] = issue.message;
    }
  }
  return result;
}

export function parseHttpAuthError(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'An unexpected error occurred.';
  }
  const body = err.error as Partial<ApiErrorBody> | string | undefined;
  if (typeof body === 'string') return body;
  if (body && typeof body === 'object') {
    const m = body.message;
    if (Array.isArray(m)) return m.join(', ');
    if (typeof m === 'string') return m;
  }
  return err.message || 'Request failed.';
}
