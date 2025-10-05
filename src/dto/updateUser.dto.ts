import { Gender } from '@generated/index';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsIn,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Gender), { message: 'Gender must be male or female' })
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsString()
  @IsNotEmpty()
  addressOne: string;

  @IsString()
  @IsOptional()
  addressTwo: string;

  @IsNumber()
  @IsNotEmpty()
  postNumber: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;
}
