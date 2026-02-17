import crypto from 'node:crypto';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword, hashPassword } from '../utils';
import {
  MESSAGES,
  PRISMA_ERROR_CODES,
  REFRESH_TOKEN_EXPIRY,
} from '../constants';
import {
  LoginDto,
  LoginResponse,
  RegisterDto,
  RegisterResponse,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private randomToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * The `register` function in TypeScript asynchronously creates a new user by hashing the password and
   * storing the user data in a database, handling potential errors such as conflicts or internal server
   * errors.
   * @param {RegisterDto} data - The `data` parameter in the `register` function is of type
   * `RegisterDto`, which likely contains the information needed to register a user, such as email,
   * password, and name. This data is used to create a new user in the database by hashing the password
   * and storing the user's email
   * @returns The `register` function is returning a `Promise` that resolves to a `RegisterResponse`
   * object. The `RegisterResponse` object contains the `id`, `name`, and `email` properties of the user
   * that was created in the database.
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    try {
      const hashedPassword = await hashPassword(data.password);

      return await this.prismaService.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
        select: { id: true, name: true, email: true },
      });
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === PRISMA_ERROR_CODES.CONFLICT) {
          throw new ConflictException(`${data.email} already exists.`);
        }
      }
      throw new InternalServerErrorException(`Failed to create user`);
    }
  }

  /**
   * The login function in TypeScript asynchronously validates user credentials, generates a refresh
   * token, and returns a LoginResponse object.
   * @param {LoginDto} data - The `data` parameter in the `login` function is of type `LoginDto`, which
   * likely contains the user's login credentials such as email and password. It is used to authenticate
   * the user during the login process.
   * @returns The `login` function returns a `Promise` that resolves to a `LoginResponse` object. The
   * `LoginResponse` object contains the following properties:
   * - `user`: An object containing the user's `id`, `name`, and `email`.
   * - `accessToken`: A JSON Web Token (JWT) generated using the user's `id`.
   * - `refreshToken`: A randomly generated token that
   */
  async login(data: LoginDto): Promise<LoginResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: data.email },
      select: { id: true, name: true, email: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    const { password, ...safeUser } = user;
    const isPasswordValid = await comparePassword(password, data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(`Invalid credentials`);
    }

    const refreshToken = this.randomToken();
    await this.prismaService.refreshToken.create({
      data: {
        userId: user.id,
        token: this.hashToken(refreshToken),
        expiresAt: REFRESH_TOKEN_EXPIRY,
      },
    });

    return {
      user: safeUser,
      accessToken: this.jwtService.sign({
        id: user.id,
      }),
      refreshToken,
    };
  }

  /**
   * The `refresh` function in TypeScript refreshes a user's token by checking and validating a refresh
   * token before signing a new token.
   * @param {string} token - The `refresh` method in the code snippet you provided is an asynchronous
   * function that takes a `token` parameter of type string. This method is responsible for refreshing a
   * user's access token based on the provided refresh token.
   * @returns The `refresh` function is returning a Promise that resolves to a string. The string being
   * returned is a JSON Web Token (JWT) signed with the user ID extracted from the refresh token.
   */
  async refresh(token: string): Promise<string> {
    const hashedToken = this.hashToken(token);
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { token: hashedToken, expiresAt: { gte: new Date() } },
      select: { id: true, user: { select: { id: true } } },
    });

    if (!refreshToken) {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }

    return this.jwtService.sign({
      id: refreshToken.user.id,
    });
  }

  /**
   * This TypeScript function logs out a user by deleting all refresh tokens associated with their user
   * ID.
   * @param {string} userId - The `userId` parameter in the `logout` function is a string that
   * represents the unique identifier of the user who is logging out. This identifier is used to delete
   * all refresh tokens associated with the user in the database.
   */
  async logout(userId: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: { user: { id: userId } },
    });
  }
}
