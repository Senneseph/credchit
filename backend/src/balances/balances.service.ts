import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Balance } from './entities/balance.entity';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    private readonly dataSource: DataSource,
  ) {}

  async createForUser(userId: string): Promise<Balance> {
    const balance = this.balanceRepository.create({
      userId,
      amount: 0,
    });
    return this.balanceRepository.save(balance);
  }

  async createForMerchant(merchantId: string): Promise<Balance> {
    const balance = this.balanceRepository.create({
      merchantId,
      amount: 0,
    });
    return this.balanceRepository.save(balance);
  }

  async getByUserId(userId: string): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { userId },
    });
    if (!balance) {
      throw new NotFoundException('Balance not found');
    }
    return balance;
  }

  async getByMerchantId(merchantId: string): Promise<Balance> {
    const balance = await this.balanceRepository.findOne({
      where: { merchantId },
    });
    if (!balance) {
      throw new NotFoundException('Balance not found');
    }
    return balance;
  }

  async topup(userId: string, amount: number): Promise<Balance> {
    const balance = await this.getByUserId(userId);
    balance.amount = Number(balance.amount) + amount;
    return this.balanceRepository.save(balance);
  }

  async transfer(fromUserId: string, toMerchantId: string, amount: number): Promise<{ fromBalance: Balance; toBalance: Balance }> {
    return this.dataSource.transaction(async manager => {
      const fromBalance = await manager.findOne(Balance, { where: { userId: fromUserId } });
      const toBalance = await manager.findOne(Balance, { where: { merchantId: toMerchantId } });

      if (!fromBalance || !toBalance) {
        throw new NotFoundException('Balance not found');
      }

      if (Number(fromBalance.amount) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      fromBalance.amount = Number(fromBalance.amount) - amount;
      toBalance.amount = Number(toBalance.amount) + amount;

      await manager.save(fromBalance);
      await manager.save(toBalance);

      return { fromBalance, toBalance };
    });
  }

  async withdraw(merchantId: string, amount: number): Promise<Balance> {
    const balance = await this.getByMerchantId(merchantId);
    
    if (Number(balance.amount) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    balance.amount = Number(balance.amount) - amount;
    return this.balanceRepository.save(balance);
  }
}

