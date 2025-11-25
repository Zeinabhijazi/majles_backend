import { Module } from '@nestjs/common';
import { VerifyEmailController } from './verify-email.controller';
import { VerifyEmailService } from './verify-email.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [VerifyEmailController],
  providers: [VerifyEmailService, PrismaService]
})
export class VerifyEmailModule {}
