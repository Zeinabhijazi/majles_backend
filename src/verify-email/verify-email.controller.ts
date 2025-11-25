import { Controller, Get, Param } from '@nestjs/common';
import { VerifyEmailService } from './verify-email.service';

@Controller('verify-email')
export class VerifyEmailController {
  constructor(
    private readonly verifyEmailService: VerifyEmailService
  ) {}

  @Get('verify/:token/:userId')
  verifyEmail(
    @Param('token') token: string,
    @Param('userId') userId: string, // string from params
  ) {
    return this.verifyEmailService.verifyEmail(token, Number(userId));
  }
}
