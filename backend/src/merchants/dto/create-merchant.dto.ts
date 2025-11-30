import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  businessName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

