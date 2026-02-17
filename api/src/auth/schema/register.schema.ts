import { z } from 'zod';

export const RegisterSchema = z
  .object({
    name: z
      .string('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(30, 'Name must be at most 30 characters'),
    email: z.string('Email is required').email('Invalid email address'),
    password: z
      .string('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(30, 'Password must be at most 30 characters'),
  })
  .strict();
