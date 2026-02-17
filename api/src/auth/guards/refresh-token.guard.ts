import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { COOKIES, MESSAGES } from '../../constants';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies?.[COOKIES.REFRESH_TOKEN] as string;

    if (!refreshToken) {
      throw new ForbiddenException(MESSAGES.NO_REFRESH_TOKEN);
    }

    return true;
  }
}
