import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly balancesService: BalancesService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      ...createPaymentDto,
      type: TransactionType.PAYMENT,
      status: TransactionStatus.PENDING,
    });

    const savedTx = await this.transactionRepository.save(transaction);

    try {
      await this.balancesService.transfer(
        createPaymentDto.fromUserId,
        createPaymentDto.toMerchantId,
        createPaymentDto.amount,
      );

      savedTx.status = TransactionStatus.COMPLETED;
      return this.transactionRepository.save(savedTx);
    } catch (error) {
      savedTx.status = TransactionStatus.FAILED;
      await this.transactionRepository.save(savedTx);
      throw error;
    }
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      relations: ['fromUser', 'toMerchant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { fromUserId: userId },
      relations: ['toMerchant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByMerchantId(merchantId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { toMerchantId: merchantId },
      relations: ['fromUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const tx = await this.transactionRepository.findOne({
      where: { id },
      relations: ['fromUser', 'toMerchant'],
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    return tx;
  }
}

