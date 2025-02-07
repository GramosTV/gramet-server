import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  street: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  houseNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  apartmentNumber?: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  city: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  zipCode: string;
}
