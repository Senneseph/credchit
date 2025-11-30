import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';
import { BalancesModule } from '../balances/balances.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    forwardRef(() => BalancesModule),
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}

