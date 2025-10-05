import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsOptional,
} from 'class-validator';
import { Gender, UserType } from '@generated/index';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  addressOne: string;

  @IsString()
  @IsOptional()
  addressTwo: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsNotEmpty()
  postNumber: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Gender), { message: 'Gender must be male or female' })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(UserType), {
    message: 'Type must be admin or user or reader',
  })
  userType: UserType;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
