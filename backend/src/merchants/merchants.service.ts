import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { Merchant } from './entities/merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly balancesService: BalancesService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const existing = await this.merchantRepository.findOne({
      where: { email: createMerchantDto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(createMerchantDto.password, 10);
    const apiKey = `cred_${nanoid(32)}`;

    const merchant = this.merchantRepository.create({
      ...createMerchantDto,
      passwordHash,
      apiKey,
    });

    const savedMerchant = await this.merchantRepository.save(merchant);
    
    // Create balance for merchant
    await this.balancesService.createForMerchant(savedMerchant.id);

    return savedMerchant;
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find({
      relations: ['balance'],
    });
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
      relations: ['balance'],
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant;
  }

  async findByApiKey(apiKey: string): Promise<Merchant | null> {
    return this.merchantRepository.findOne({
      where: { apiKey },
    });
  }
}

