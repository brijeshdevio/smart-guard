import z from 'zod';
import { RegisterSchema, LoginSchema } from './schema';

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

type UserResponse = {
  id: string;
  email: string;
  name: string;
};

export type RegisterResponse = UserResponse;

export type LoginResponse = {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
};
