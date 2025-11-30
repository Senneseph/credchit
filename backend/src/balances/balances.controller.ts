import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { TopupDto } from './dto/topup.dto';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string) {
    return this.balancesService.getByUserId(userId);
  }

  @Get('merchant/:merchantId')
  getByMerchantId(@Param('merchantId') merchantId: string) {
    return this.balancesService.getByMerchantId(merchantId);
  }

  @Post('topup')
  topup(@Body() topupDto: TopupDto) {
    return this.balancesService.topup(topupDto.userId, topupDto.amount);
  }
}

