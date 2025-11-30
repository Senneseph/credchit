import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Merchant, Transaction } from '../../services/api.service';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="container">
      <h1>Merchant Portal</h1>

      @if (!selectedMerchant()) {
        <section class="merchant-select card">
          <h2>Register or Select Merchant</h2>

          <div class="form-group">
            <h3>Register New Business</h3>
            <input [(ngModel)]="newBusinessName" placeholder="Business Name">
            <input [(ngModel)]="newEmail" placeholder="Email" type="email">
            <input [(ngModel)]="newPassword" placeholder="Password" type="password">
            <button class="btn btn-primary" (click)="createMerchant()">Register</button>
          </div>

          <div class="divider">OR</div>

          <div class="merchants-list">
            <h3>Select Existing Merchant</h3>
            @for (merchant of merchants(); track merchant.id) {
              <div class="merchant-item" (click)="selectMerchant(merchant)">
                <span class="biz-name">{{ merchant.businessName }}</span>
                <span class="badge">Trust Level {{ merchant.trustBadgeLevel }}</span>
              </div>
            }
          </div>
        </section>
      } @else {
        <section class="merchant-dashboard">
          <div class="header-row">
            <h2>{{ selectedMerchant()!.businessName }}</h2>
            <button class="btn btn-secondary" (click)="clearSelectedMerchant()">Switch</button>
          </div>

          <div class="stats-grid">
            <div class="stat card">
              <div class="stat-label">Balance</div>
              <div class="stat-value">\${{ selectedMerchant()!.balance?.amount || 0 | number:'1.2-2' }}</div>
            </div>
            <div class="stat card">
              <div class="stat-label">Trust Level</div>
              <div class="stat-value">{{ selectedMerchant()!.trustBadgeLevel }}</div>
            </div>
            <div class="stat card">
              <div class="stat-label">Transactions</div>
              <div class="stat-value">{{ transactions().length }}</div>
            </div>
          </div>

          <div class="transactions card">
            <h3>Recent Payments</h3>
            @for (tx of transactions(); track tx.id) {
              <div class="tx-item">
                <div class="tx-info">
                  <span class="tx-from">{{ tx.fromUser?.firstName }} {{ tx.fromUser?.lastName }}</span>
                  <span class="tx-date">{{ tx.createdAt | date:'short' }}</span>
                </div>
                <span class="tx-amount">+\${{ tx.amount | number:'1.2-2' }}</span>
              </div>
            } @empty {
              <p class="no-tx">No payments received yet</p>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 2rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .form-group h3 { margin-bottom: 0.5rem; }
    .divider { text-align: center; color: var(--text-muted); margin: 1.5rem 0; }
    .merchants-list h3 { margin-bottom: 1rem; }
    .merchant-item {
      display: flex; justify-content: space-between; align-items: center; padding: 1rem;
      background: var(--background); border-radius: 0.5rem; cursor: pointer;
      margin-bottom: 0.5rem; &:hover { background: var(--border); }
    }
    .biz-name { font-weight: 500; }
    .badge { background: var(--primary); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat { text-align: center; }
    .stat-label { color: var(--text-muted); margin-bottom: 0.5rem; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--secondary); }
    .transactions h3 { margin-bottom: 1rem; }
    .tx-item { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border); }
    .tx-info { display: flex; flex-direction: column; }
    .tx-from { font-weight: 500; }
    .tx-date { font-size: 0.875rem; color: var(--text-muted); }
    .tx-amount { color: var(--success); font-weight: 600; }
    .no-tx { color: var(--text-muted); text-align: center; padding: 2rem; }
  `]
})
export class MerchantsComponent implements OnInit {
  private api = inject(ApiService);

  // Signals for zoneless change detection
  merchants = signal<Merchant[]>([]);
  selectedMerchant = signal<Merchant | null>(null);
  transactions = signal<Transaction[]>([]);

  // Form fields
  newBusinessName = '';
  newEmail = '';
  newPassword = '';

  ngOnInit() { this.loadMerchants(); }

  loadMerchants() {
    this.api.getMerchants().subscribe(merchants => this.merchants.set(merchants));
  }

  selectMerchant(merchant: Merchant) {
    this.selectedMerchant.set(merchant);
    this.api.getTransactions().subscribe(txs => {
      this.transactions.set(txs.filter(tx => tx.toMerchant?.id === merchant.id));
    });
  }

  clearSelectedMerchant() {
    this.selectedMerchant.set(null);
  }

  createMerchant() {
    const newMerchant = {
      businessName: this.newBusinessName,
      email: this.newEmail,
      password: this.newPassword
    };
    this.api.createMerchant(newMerchant).subscribe(merchant => {
      this.merchants.update(merchants => [...merchants, merchant]);
      this.selectMerchant(merchant);
      this.newBusinessName = '';
      this.newEmail = '';
      this.newPassword = '';
    });
  }
}

