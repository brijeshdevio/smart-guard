import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGES } from '../constants';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * This TypeScript function asynchronously finds a user by their ID and returns selected user data,
   * throwing an UnauthorizedException if the user is not found.
   * @param {string} id - The `findById` function takes an `id` parameter of type string. This function
   * is responsible for finding a user by their unique identifier and returning specific fields such as
   * id, email, name, createdAt, and updatedAt. If the user is not found, it throws an
   * UnauthorizedException with a message defined
   * @returns The `findById` function is returning the user object with the specified properties (id,
   * email, name, createdAt, updatedAt) if the user is found in the database. If the user is not found,
   * it throws an `UnauthorizedException` with the message "Unauthorized".
   */
  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    return user;
  }
}
