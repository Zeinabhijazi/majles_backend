import { Body, Controller, Put } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto } from '@/dto/resetPassword';

@Controller('reset-password')
export class ResetPasswordController {
  constructor(
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @Put('resetPassword')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.resetPasswordService.resetPassword(dto);
  }
}
