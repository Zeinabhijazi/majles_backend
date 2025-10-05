import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}
