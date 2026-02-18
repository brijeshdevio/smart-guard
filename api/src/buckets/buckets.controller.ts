import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards';
import { ZodValidationPipe } from '../common/pipes';
import { CurrentUser } from '../common/decorators';
import { apiResponse } from '../utils';
import { MESSAGES } from '../constants';
import { BucketsService } from './buckets.service';
import { CreateBucketSchema, UpdateBucketSchema } from './schema';
import type { CreateBucketDto, UpdateBucketDto } from './buckets.types';

@Controller('buckets')
@UseGuards(JwtAuthGuard)
export class BucketsController {
  constructor(private readonly bucketsService: BucketsService) {}

  @Post()
  async createBucket(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(CreateBucketSchema)) data: CreateBucketDto,
    @Res() res: Response,
  ) {
    const bucket = await this.bucketsService.createBucket(userId, data);
    return apiResponse(res, {
      data: { bucket },
      message: MESSAGES.BUCKET_CREATION_SUCCESS,
    });
  }

  @Get()
  async findBuckets(@CurrentUser('id') userId: string, @Res() res: Response) {
    const buckets = await this.bucketsService.findBuckets(userId);
    return apiResponse(res, { data: { buckets } });
  }

  @Get(':id')
  async findBucketById(
    @CurrentUser('id') userId: string,
    @Param('id') bucketId: string,
    @Res() res: Response,
  ) {
    const bucket = await this.bucketsService.findBucketById(userId, bucketId);
    return apiResponse(res, { data: { bucket } });
  }

  @Patch(':id')
  async updateBucket(
    @CurrentUser('id') userId: string,
    @Param('id') bucketId: string,
    @Body(new ZodValidationPipe(UpdateBucketSchema)) data: UpdateBucketDto,
    @Res() res: Response,
  ) {
    const bucket = await this.bucketsService.updateBucket(
      userId,
      bucketId,
      data,
    );
    return apiResponse(res, {
      data: { bucket },
      message: MESSAGES.BUCKET_UPDATE_SUCCESS,
    });
  }

  @Delete(':id')
  async deleteBucket(
    @CurrentUser('id') userId: string,
    @Param('id') bucketId: string,
    @Res() res: Response,
  ) {
    const bucket = await this.bucketsService.deleteBucket(userId, bucketId);
    return apiResponse(res, { data: { bucket } });
  }
}
