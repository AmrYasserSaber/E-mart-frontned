import { describe, expect, it } from 'vitest';
import { Role } from '../models/user.model';
import { registerBodySchema } from './auth.schemas';

describe('registerBodySchema', () => {
  it('accepts normal user signup without seller profile fields', () => {
    const result = registerBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: Role.USER,
    });

    expect(result.success).toBe(true);
  });

  it('requires storeName and description when signing up as seller', () => {
    const result = registerBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: Role.SELLER,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('storeName');
      expect(paths).toContain('description');
    }
  });

  it('accepts seller signup when seller profile fields are provided', () => {
    const result = registerBodySchema.safeParse({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: Role.SELLER,
      storeName: 'Green Store',
      description: 'Eco-friendly products and essentials',
    });

    expect(result.success).toBe(true);
  });
});
