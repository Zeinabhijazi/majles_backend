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
import { SendMailService } from '@/send-mail/send-mail.service';

@Injectable({})
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailService: SendMailService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. Check if password and confirmPassword match
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hash = await argon.hash(dto.password); // Hash the password

    try {
      // 2. Create user
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
      
      // 3. Generate raw token
      const rawToken = uuidv4(); 

      // 4. Save token in database
      await this.prisma.emailVerification.create({
        data: {
          tokenId: rawToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          userId: user.id,
        },
      });

      // 5. Build verification link
      const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${rawToken}/${user.id}`;

      // 6. Send email
      await this.mailService.sendVerificationEmail(user.email, verifyLink);

      return {
        user,
        message: "Signup successful! Please check your email to verify your account.",
      };
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        gender: true,
        phoneNumber: true,
        latitude: true,
        longitude: true,
        addressOne: true,
        addressTwo: true,
        country: true,
        city: true,
        postNumber: true,
        email: true,
        userType: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const fullUser = await this.prisma.user.findUnique({
      where: { email: dto.email, isDeleted: false },
    });

    if (!fullUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the password is correct for this account
    const pwdMatches = await argon.verify(fullUser.password, dto.password);

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
