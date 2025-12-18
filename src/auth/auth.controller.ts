import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '@/dto/signup.dto';
import { SigninDto } from '@/dto/signin.dto';
import { ForgetPasswordDto } from '@/dto/forget-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post('signup')
  @HttpCode(200)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
  
  @Post("forget-password")
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    return this.authService.forgetPassword(dto);
  }
}
