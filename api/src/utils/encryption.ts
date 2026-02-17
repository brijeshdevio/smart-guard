import argon from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon.hash(password);
}

export async function comparePassword(
  hashedPassword: string,
  password: string,
): Promise<boolean> {
  return await argon.verify(hashedPassword, password);
}
