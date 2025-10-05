import { Controller, Post, Get, Body, HttpCode, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from '@/dto/signup.dto';
import { SigninDto } from '@/dto/signin.dto';

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

}
