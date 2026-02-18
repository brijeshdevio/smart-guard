import { z } from 'zod';

export const UpdateBucketSchema = z
  .object({
    name: z
      .string('Bucket name must be a string')
      .min(5, 'Bucket name must be at least 5 characters long')
      .max(40, 'Bucket name must be at most 40 characters long')
      .optional(),
    pricePerRequest: z
      .number('Price per request must be a number')
      .positive('Price per request must be a positive number')
      .nonnegative('Price per request must be a non-negative number')
      .finite('Price per request must be a finite number')
      .optional(),
    rateLimitRpm: z
      .number('Rate limit (RPM) must be a number')
      .positive('Rate limit (RPM) must be a positive number')
      .nonnegative('Rate limit (RPM) must be a non-negative number')
      .finite('Rate limit (RPM) must be a finite number')
      .optional(),
    dailyBudget: z
      .number('Daily budget must be a number')
      .positive('Daily budget must be a positive number')
      .nonnegative('Daily budget must be a non-negative number')
      .finite('Daily budget must be a finite number')
      .optional(),
    monthlyBudget: z
      .number('Monthly budget must be a number')
      .positive('Monthly budget must be a positive number')
      .nonnegative('Monthly budget must be a non-negative number')
      .finite('Monthly budget must be a finite number')
      .optional(),
    description: z
      .string('Bucket description must be a string')
      .max(255, 'Bucket description must be at most 255 characters long')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.dailyBudget && data.pricePerRequest) {
      if (data.dailyBudget < data.pricePerRequest) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Daily budget must be greater than or equal to price per request',
          path: ['dailyBudget'],
        });
      }
    }
    if (data.monthlyBudget && data.pricePerRequest) {
      if (data.monthlyBudget < data.pricePerRequest) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Monthly budget must be greater than or equal to price per request',
          path: ['monthlyBudget'],
        });
      }
    }
    if (data.dailyBudget && data.monthlyBudget) {
      if (data.dailyBudget >= data.monthlyBudget) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Daily budget must be less than monthly budget',
          path: ['dailyBudget'],
        });
      }
    }
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })
  .strict();
