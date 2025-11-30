import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, Merchant } from '../../services/api.service';

@Component({
  selector: 'app-pay',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="container">
      <h1>Make a Payment</h1>

      <section class="pay-form card">
        <div class="form-row">
          <div class="form-group">
            <label>From User</label>
            <select [(ngModel)]="selectedUserId">
              <option value="">Select User</option>
              @for (user of users(); track user.id) {
                <option [value]="user.id">
                  {{ user.firstName }} {{ user.lastName }} (\${{ user.balance?.amount || 0 | number:'1.2-2' }})
                </option>
              }
            </select>
          </div>

          <div class="form-group">
            <label>To Merchant</label>
            <select [(ngModel)]="selectedMerchantId">
              <option value="">Select Merchant</option>
              @for (merchant of merchants(); track merchant.id) {
                <option [value]="merchant.id">{{ merchant.businessName }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Amount</label>
            <input [(ngModel)]="amount" type="number" min="0.01" step="0.01" placeholder="0.00">
          </div>

          <div class="form-group">
            <label>Description (optional)</label>
            <input [(ngModel)]="description" placeholder="Coffee, lunch, etc.">
          </div>
        </div>

        <button class="btn btn-success pay-btn" (click)="pay()" [disabled]="!canPay()">
          Pay \${{ amount | number:'1.2-2' }}
        </button>

        @if (message()) {
          <div class="message" [class.success]="success()" [class.error]="!success()">
            {{ message() }}
          </div>
        }
      </section>

      <section class="quick-amounts">
        <p>Quick amounts:</p>
        <div class="amounts">
          @for (amt of quickAmounts; track amt) {
            <button class="btn btn-secondary" (click)="amount = amt">\${{ amt }}</button>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    h1 { margin-bottom: 2rem; }
    .pay-form { max-width: 600px; margin: 0 auto; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-weight: 500; color: var(--text-muted); }
    select {
      padding: 0.75rem 1rem; border-radius: 0.5rem;
      border: 1px solid var(--border); background: var(--background);
      color: var(--text); font-size: 1rem;
    }
    .pay-btn { width: 100%; margin-top: 1rem; padding: 1rem; font-size: 1.25rem; }
    .message {
      margin-top: 1rem; padding: 1rem; border-radius: 0.5rem; text-align: center;
      &.success { background: rgba(34, 197, 94, 0.2); color: var(--success); }
      &.error { background: rgba(239, 68, 68, 0.2); color: var(--error); }
    }
    .quick-amounts {
      max-width: 600px; margin: 2rem auto; text-align: center;
      p { color: var(--text-muted); margin-bottom: 1rem; }
    }
    .amounts { display: flex; gap: 1rem; justify-content: center; }
    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class PayComponent implements OnInit {
  private api = inject(ApiService);

  // Signals for zoneless change detection
  users = signal<User[]>([]);
  merchants = signal<Merchant[]>([]);
  message = signal('');
  success = signal(false);

  // Form fields (regular properties work with ngModel + user events)
  selectedUserId = '';
  selectedMerchantId = '';
  amount = 10;
  description = '';

  // Static data
  readonly quickAmounts = [5, 10, 20, 50];

  ngOnInit() {
    this.api.getUsers().subscribe(users => this.users.set(users));
    this.api.getMerchants().subscribe(merchants => this.merchants.set(merchants));
  }

  canPay(): boolean {
    return !!this.selectedUserId && !!this.selectedMerchantId && this.amount > 0;
  }

  pay() {
    if (!this.canPay()) return;

    this.api.pay(this.selectedUserId, this.selectedMerchantId, this.amount, this.description).subscribe({
      next: (tx) => {
        this.message.set(`Payment successful! Transaction ID: ${tx.id.slice(0, 8)}...`);
        this.success.set(true);
        // Refresh users to get updated balances
        this.api.getUsers().subscribe(users => this.users.set(users));
      },
      error: (err) => {
        this.message.set(err.error?.message || 'Payment failed. Check your balance.');
        this.success.set(false);
      }
    });
  }
}

