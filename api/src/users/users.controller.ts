import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';
import { apiResponse } from '../utils';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async findById(@CurrentUser('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findById(id);
    return apiResponse(res, { data: { user } });
  }
}
