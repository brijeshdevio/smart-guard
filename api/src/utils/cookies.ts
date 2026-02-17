import type { CookieOptions, Response } from 'express';
import { envConfig } from '../config';
import { COOKIES } from '../constants';

const isProd = envConfig.NODE_ENV === 'production';

export function setCookie(
  key: string,
  token: string,
  res: Response,
  options?: CookieOptions,
): void {
  res.cookie(key, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: COOKIES.ACCESS_TOKEN_EXPIRY,
    ...options,
  });
}

export function clearCookie(key: string, res: Response): void {
  res.clearCookie(key);
}
