import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards';
import { ZodValidationPipe } from '../common/pipes';
import { Cookies } from '../common/decorators';
import { COOKIES, MESSAGES } from '../constants';
import { apiResponse, clearCookie, setCookie } from '../utils';
import { AuthService } from './auth.service';
import { LoginSchema, RegisterSchema } from './schema';
import { RefreshTokenGuard } from './guards';
import type { LoginDto, RegisterDto } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() body: RegisterDto, @Res() res: Response) {
    const user = await this.authService.register(body);
    return apiResponse(res, {
      statusCode: 201,
      data: { user },
      message: MESSAGES.USER_CREATION_SUCCESS,
    });
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(body);
    setCookie(COOKIES.ACCESS_TOKEN, accessToken, res);
    setCookie(COOKIES.REFRESH_TOKEN, refreshToken, res, {
      maxAge: COOKIES.REFRESH_TOKEN_EXPIRY,
    });
    return apiResponse(res, {
      data: { user },
      message: MESSAGES.USER_LOGIN_SUCCESS,
    });
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Cookies(COOKIES.REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    const accessToken = await this.authService.refresh(refreshToken);
    setCookie(COOKIES.ACCESS_TOKEN, accessToken, res);
    return apiResponse(res, {
      message: MESSAGES.TOKEN_REFRESH_SUCCESS,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Cookies(COOKIES.REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    await this.authService.logout(refreshToken);
    clearCookie(COOKIES.ACCESS_TOKEN, res);
    clearCookie(COOKIES.REFRESH_TOKEN, res);
    return apiResponse(res, {
      message: MESSAGES.USER_LOGOUT_SUCCESS,
    });
  }
}
