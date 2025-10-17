import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsOptional,
} from 'class-validator';

export class OrderDto {
  @IsOptional()
  @IsNumber()
  readerId?: number;

  @IsDate()
  @IsNotEmpty()
  orderDate: Date;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsString()
  addressOne?: string;

  @IsOptional()
  @IsString()
  addressTwo: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  postNumber?: number;
}
