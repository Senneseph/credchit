import { IsNumber, IsPositive, IsUUID, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  fromUserId: string;

  @IsUUID()
  toMerchantId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;
}

