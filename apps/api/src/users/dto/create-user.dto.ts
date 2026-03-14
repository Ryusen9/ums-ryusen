import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(250)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(250)
  lastName!: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
