import { Body, Controller, Get, Inject, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { UserContextService } from '@/singleton/user-context.service';
import { UpdateUserDto } from '@/dto/updateUser.dto';
import { ChangePasswordDto } from '@/dto/changePassword';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(UserContextService)
    private readonly user: UserContextService,
  ) {}

  // Fetch the details of the user who is currently logged in:
  @Get()
  async getProfile() {
    return await this.userService.getUserById(this.user.user.id);
  }

  // To edit the profile of the user who is currently logged in:
  @Put()
  async updateProfileUser(@Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUserById(
      this.user.user.id,
      updateUserDto,
    );
  }

  // To edit the profile of the user who is currently logged in:
  @Put('changePassword')
  async updateUserPassword(@Body() changePasswordDto: ChangePasswordDto) {
    return await this.userService.changePassword(
      this.user.user.id,
      changePasswordDto,
    );
  }
}
