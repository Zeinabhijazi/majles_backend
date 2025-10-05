import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { AuthenticationMiddleware } from './middlewares/authentication/authentication.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SingletonModule } from './singleton/singleton.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SendMailModule } from './send-mail/send-mail.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    OrderModule,
    JwtModule,
    SingletonModule,
    PrismaModule,
    AdminModule,
    DashboardModule,
    SendMailModule,
  ],
  providers: [JwtService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude({
        path: '/auth/(.*)',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: '/dashboard/(.*)',
        method: RequestMethod.ALL,
      })
      .exclude({
        path: '/mail/send',
        method: RequestMethod.ALL,
      })
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
