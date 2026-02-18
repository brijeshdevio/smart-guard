import z from 'zod';
import { CreateBucketSchema, UpdateBucketSchema } from './schema';

export type CreateBucketDto = z.infer<typeof CreateBucketSchema>;
export type UpdateBucketDto = z.infer<typeof UpdateBucketSchema>;

export type BucketResponse = {
  id: string;
  name: string;
  pricePerRequest: number;
  rateLimitRpm: number | null;
  dailyBudget: number | null;
  monthlyBudget: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBucketResponse = BucketResponse & { apiKey: string };
export type FindBucketsResponse = Omit<BucketResponse, 'description'>[];
export type FindBucketResponse = BucketResponse;
export type UpdateBucketResponse = BucketResponse;
export type DeleteBucketResponse = BucketResponse;
