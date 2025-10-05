import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '@/dto/updateUser.dto';
import { UserType } from './user_type/user_type';
import { ChangePasswordDto } from '@/dto/changePassword';
import * as argon from 'argon2';

@Injectable({})
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<UserType | null>{
    return await this.prisma.user.findFirst({
      where: { 
        id: id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        addressOne: true,
        addressTwo: true,
        country: true,
        city: true,
        postNumber: true,
        gender: true,
        userType: true,
        latitude: true,
        longitude: true,
      },
    });
  }

  async updateUserById( id: number, updateUserDto: UpdateUserDto ) {
    // only check existence
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        isDeleted: false,
      },
    });

    if(!user) {
      throw new NotFoundException(`User with ${id} not found`);
    }

    const userNewData  = {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      gender: updateUserDto.gender,
      phoneNumber: updateUserDto.phoneNumber,
      longitude: updateUserDto.longitude,
      latitude: updateUserDto.latitude,
      addressOne: updateUserDto.addressOne,
      addressTwo: updateUserDto.addressTwo,
      postNumber: updateUserDto.postNumber,
      country: updateUserDto.country,
      city: updateUserDto.city,
    }
    return this.prisma.user.update({
      where: { id },
      data: userNewData,
      select: {
        firstName: true,
        lastName: true,
        gender: true,
        phoneNumber: true,
        longitude: true,
        latitude: true,
        addressOne: true,
        addressTwo: true,
        postNumber: true,
        country: true,
        city: true,
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    
    const isMatch = await argon.verify(user.password, dto.oldPassword);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    const hashedPassword = await argon.hash(dto.newPassword);

    const password = {
      password : hashedPassword
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: password,
    });

    return 'Password changed successfully';
  };
}
