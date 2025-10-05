import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@generated/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '@/dto/signup.dto';
import { SigninDto } from '@/dto/signin.dto';
import { v4 as uuidv4 } from 'uuid';
import { LoginResponse } from './auth_types/LoginResponse';

@Injectable({})
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // Check if password and confirmPassword match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hash = await argon.hash(dto.password); // Hash the password

    try {
      const user = await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender,
          userType: dto.userType,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          password: hash,
          longitude: dto.longitude,
          latitude: dto.latitude,
          addressOne: dto.addressOne,
          addressTwo: dto.addressTwo,
          postNumber: dto.postNumber,
          country: dto.country,
          city: dto.city,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('This user is already exist.');
        }
      }
      throw error;
    }
  }

  async signin(dto: SigninDto) {
    // Check if this user exist
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
        isDeleted: false, 
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the password is correct for this account
    const pwdMatches = await argon.verify(user.password, dto.password);

    if (!pwdMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authUUID = uuidv4();
    const token = await this.signToken(authUUID, user.id);

    return {
      ...user,
      token,
    };
  }

  async signToken(authTokenId: string, userId: number): Promise<string> {
    const payload = {
      id: authTokenId,
    };

    const secret = process.env.JWT_SECRET;

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1y',
      secret: secret,
    });

    const expiryDate: Date = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    this.prisma.authToken
      .create({
        data: {
          id: authTokenId,
          userId: userId,
          expirayDate: expiryDate,
        },
      })
      .then();

    return token;
  }

}
