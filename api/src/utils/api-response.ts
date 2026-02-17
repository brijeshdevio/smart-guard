import type { Response } from 'express';

export function apiResponse<D, R>(
  res: Response,
  {
    statusCode = 200,
    data,
    rest = {},
    message,
    success = true,
  }: {
    statusCode?: number;
    data?: D;
    rest?: R | { [key: string]: any };
    message?: string;
    success?: boolean;
  },
) {
  return res.status(statusCode).json({
    success,
    statusCode,
    data,
    message,
    ...rest,
  });
}
