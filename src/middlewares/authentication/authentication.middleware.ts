import { PrismaService } from '@/prisma/prisma.service';
import { UserContextService } from '@/singleton/user-context.service';
import {
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserDataType } from './user_types';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(UserContextService)
    private readonly user: UserContextService,
  ) {}

  async use(request: Request, res: any, next: () => void) {
    const token = request.headers?.authorization?.startsWith('Bearer')
      ? request.headers.authorization.split(' ')[1]
      : null;

    if (!token) {
      throw new UnauthorizedException('User is not authorized');
    }

    try {
      // Verify the access token
      const decoded = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Save decoded user in request-scoped singleton
      let userData : UserDataType | null = await this.prisma.authToken.findFirst({
        include: {
          user: true,
        },
        where: {
          id: decoded.id
        },
      });

      if (!userData) {
        throw new UnauthorizedException("User data not found")
      }
      
      // Save user in singleton
      this.user.user = userData.user;

      //console.log(this.user.user)
    } catch (err) {
      if (
        err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError'
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      // Let other errors propagate naturally
      throw err;
    }

    next();
  }
}
