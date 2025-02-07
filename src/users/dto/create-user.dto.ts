import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';

class CreateCartItemDto {
  @IsNotEmpty()
  @IsString()
  @Length(24, 24)
  productId: string;

  @IsNotEmpty()
  @Min(1)
  @Max(100)
  quantity: number;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  surname: string;

  @IsNotEmpty()
  @IsEmail()
  @Length(5, 100)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 20)
  password: string;

  @IsOptional()
  @IsString()
  @Length(9, 15)
  phoneNumber?: string;
}
