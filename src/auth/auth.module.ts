import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ResponseInterceptor } from '@/interceptors/response.interceptor';
import { SendMailService } from '@/send-mail/send-mail.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [ResponseInterceptor, AuthService, SendMailService, PrismaService],
})
export class AuthModule {}
