import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('pay')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.transactionsService.createPayment(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.transactionsService.findByUserId(userId);
  }

  @Get('merchant/:merchantId')
  findByMerchantId(@Param('merchantId') merchantId: string) {
    return this.transactionsService.findByMerchantId(merchantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}

