import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordController } from './reset-password.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ResetPasswordController],
   providers: [ResetPasswordService, PrismaService]
})
export class ResetPasswordModule {}
