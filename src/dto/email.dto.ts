import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EmailDTO {
  @IsOptional()
  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  @IsString()
  message: string;
}