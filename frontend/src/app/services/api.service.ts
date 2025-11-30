import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  achLinked: boolean;
  credLevel: number;
  balance?: Balance;
}

export interface Merchant {
  id: string;
  businessName: string;
  email: string;
  category?: string;
  trustBadgeLevel: number;
  balance?: Balance;
}

export interface Balance {
  id: string;
  amount: number;
  autoRefillEnabled: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  createdAt: string;
  fromUser?: User;
  toMerchant?: Merchant;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(data: { email: string; password: string; firstName: string; lastName: string }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, data);
  }

  // Merchants
  getMerchants(): Observable<Merchant[]> {
    return this.http.get<Merchant[]>(`${this.baseUrl}/merchants`);
  }

  createMerchant(data: { businessName: string; email: string; password: string }): Observable<Merchant> {
    return this.http.post<Merchant>(`${this.baseUrl}/merchants`, data);
  }

  // Balances
  getUserBalance(userId: string): Observable<Balance> {
    return this.http.get<Balance>(`${this.baseUrl}/balances/user/${userId}`);
  }

  topup(userId: string, amount: number): Observable<Balance> {
    return this.http.post<Balance>(`${this.baseUrl}/balances/topup`, { userId, amount });
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  }

  pay(fromUserId: string, toMerchantId: string, amount: number, description?: string): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/pay`, {
      fromUserId,
      toMerchantId,
      amount,
      description,
    });
  }

  // Health
  getHealth(): Observable<{ status: string; service: string; timestamp: string }> {
    return this.http.get<{ status: string; service: string; timestamp: string }>(`${this.baseUrl}/health`);
  }
}

