import crypto from 'node:crypto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service';
import { PRISMA_ERROR_CODES } from '../constants';
import type {
  CreateBucketDto,
  CreateBucketResponse,
  DeleteBucketResponse,
  FindBucketResponse,
  FindBucketsResponse,
  UpdateBucketDto,
  UpdateBucketResponse,
} from './buckets.types';

@Injectable()
export class BucketsService {
  constructor(private readonly prismaService: PrismaService) {}

  private randomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async createBucket(
    userId: string,
    data: CreateBucketDto,
  ): Promise<CreateBucketResponse> {
    try {
      const token = this.randomToken();
      const hashedKey = this.hashToken(token);
      const bucket = await this.prismaService.bucket.create({
        data: {
          userId,
          hashedKey,
          name: data.name,
          description: data.description,
          rateLimitRpm: data.rateLimitRpm,
          pricePerRequest: data.pricePerRequest,
          dailyBudget: data.dailyBudget,
          monthlyBudget: data.monthlyBudget,
        },
        omit: { hashedKey: true, userId: true },
      });
      return { ...bucket, apiKey: token };
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.CONFLICT) {
          throw new ConflictException(`${data.name} already exists.`);
        }
      }
      throw new InternalServerErrorException('Failed to create bucket.');
    }
  }

  async findBuckets(userId: string): Promise<FindBucketsResponse> {
    const buckets = await this.prismaService.bucket.findMany({
      where: { userId },
      omit: { hashedKey: true, userId: true, description: true },
    });
    return buckets;
  }

  async findBucketById(
    userId: string,
    id: string,
  ): Promise<FindBucketResponse> {
    const bucket = await this.prismaService.bucket.findFirst({
      where: { id, userId },
      omit: { hashedKey: true, userId: true },
    });

    if (!bucket) {
      throw new NotFoundException(`Bucket with id ${id} not found.`);
    }

    return bucket;
  }

  async updateBucket(
    userId: string,
    id: string,
    data: UpdateBucketDto,
  ): Promise<UpdateBucketResponse> {
    try {
      return await this.prismaService.bucket.update({
        where: { id, userId },
        data: { ...data },
        omit: { hashedKey: true, userId: true },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Bucket with id ${id} not found.`);
        }
      }
      throw new InternalServerErrorException('Failed to update bucket.');
    }
  }

  async deleteBucket(
    userId: string,
    id: string,
  ): Promise<DeleteBucketResponse> {
    try {
      return await this.prismaService.bucket.delete({
        where: { id, userId },
        omit: { hashedKey: true, userId: true },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Bucket with id ${id} not found.`);
        }
      }
      throw new InternalServerErrorException('Failed to delete bucket.');
    }
  }

  async rotateApiKey(userId: string, id: string): Promise<string> {
    try {
      const apiKey = this.randomToken();
      const hashedKey = this.hashToken(apiKey);
      await this.prismaService.bucket.update({
        where: { id, userId },
        data: { hashedKey },
        select: { id: true },
      });
      return apiKey;
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.NOT_FOUND) {
          throw new NotFoundException(`Bucket with id ${id} not found.`);
        }
      }
      throw new InternalServerErrorException('Failed to rotate api key.');
    }
  }
}
