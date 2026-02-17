import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { COOKIES, MESSAGES } from '../../constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.cookies?.[COOKIES.ACCESS_TOKEN] as string;

    if (!accessToken) {
      throw new UnauthorizedException(MESSAGES.NO_ACCESS_TOKEN);
    }

    try {
      const payload = (await this.jwtService.verifyAsync(
        accessToken,
      )) as unknown;
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }
    return true;
  }
}
