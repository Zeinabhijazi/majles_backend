import { PrismaClient } from '@generated/index';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect(); // connect when app starts
  }

  async onModuleDestroy() {
    await this.$disconnect(); // close connection when app stops
  }
}
