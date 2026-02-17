import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { COOKIES, MESSAGES } from '../../constants';

type CookieKey = (typeof COOKIES)[keyof typeof COOKIES];

export const Cookies = createParamDecorator(
  (data: CookieKey | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const cookies = request.cookies as unknown as Record<CookieKey, string>;

    if (cookies) {
      if (data && cookies[data]) return cookies[data];
      else return cookies;
    }

    throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
  },
);
