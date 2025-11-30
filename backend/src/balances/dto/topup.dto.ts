import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class TopupDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

