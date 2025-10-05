import {
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

export class AssignReaderDto {
  @IsNumber()
  @IsNotEmpty()
  readerId: number;
}