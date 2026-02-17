export const PRISMA_ERROR_CODES = {
  CONFLICT: 'P2002',
  NOT_FOUND: 'P2025',
};

const DAY = 24 * 60 * 60 * 1000;

export const COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ACCESS_TOKEN_EXPIRY: 15 * 60 * 1000,
  REFRESH_TOKEN_EXPIRY: DAY * 7,
};

export const REFRESH_TOKEN_EXPIRY = new Date(Date.now() + DAY * 7);

export const MESSAGES = {
  USER_CREATION_SUCCESS: 'User created successfully.',
  USER_LOGIN_SUCCESS: 'User logged in successfully.',
  TOKEN_REFRESH_SUCCESS: 'Token refreshed successfully.',
  USER_LOGOUT_SUCCESS: 'User logged out successfully.',
  NO_REFRESH_TOKEN: 'No refresh token found.',
  NO_ACCESS_TOKEN: 'No access token found.',
  UNAUTHORIZED: 'You are not logged in. Please login to continue.',
};
