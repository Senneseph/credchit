import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, User, Transaction } from '../../services/api.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe],
  template: `
    <div class="container">
      <h1>Your Wallet</h1>

      @if (!selectedUser()) {
        <section class="user-select card">
          <h2>Create or Select User</h2>

          <div class="form-group">
            <h3>Create New User</h3>
            <input [(ngModel)]="newUserEmail" placeholder="Email" type="email">
            <input [(ngModel)]="newUserFirstName" placeholder="First Name">
            <input [(ngModel)]="newUserLastName" placeholder="Last Name">
            <input [(ngModel)]="newUserPassword" placeholder="Password" type="password">
            <button class="btn btn-primary" (click)="createUser()">Create User</button>
          </div>

          <div class="divider">OR</div>

          <div class="users-list">
            <h3>Select Existing User</h3>
            @for (user of users(); track user.id) {
              <div class="user-item" (click)="selectUser(user)">
                <span>{{ user.firstName }} {{ user.lastName }}</span>
                <span class="email">{{ user.email }}</span>
              </div>
            }
          </div>
        </section>
      } @else {
        <section class="wallet-view">
          <div class="balance-card card">
            <div class="balance-header">
              <h2>{{ selectedUser()!.firstName }} {{ selectedUser()!.lastName }}</h2>
              <button class="btn btn-secondary" (click)="clearSelectedUser()">Switch User</button>
            </div>
            <div class="balance-amount">\${{ selectedUser()!.balance?.amount || 0 | number:'1.2-2' }}</div>
            <div class="cred-level">Cred Level: {{ selectedUser()!.credLevel }}</div>

            <div class="topup-form">
              <input [(ngModel)]="topupAmount" type="number" placeholder="Amount to add">
              <button class="btn btn-success" (click)="topup()">Top Up</button>
            </div>
          </div>

          <div class="transactions card">
            <h3>Recent Transactions</h3>
            @for (tx of transactions(); track tx.id) {
              <div class="tx-item">
                <div class="tx-info">
                  <span class="tx-merchant">{{ tx.toMerchant?.businessName || 'Unknown' }}</span>
                  <span class="tx-date">{{ tx.createdAt | date:'short' }}</span>
                </div>
                <span class="tx-amount">-\${{ tx.amount | number:'1.2-2' }}</span>
              </div>
            } @empty {
              <p class="no-tx">No transactions yet</p>
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
    .users-list h3 { margin-bottom: 1rem; }
    .user-item {
      display: flex; justify-content: space-between; padding: 1rem;
      background: var(--background); border-radius: 0.5rem; cursor: pointer;
      margin-bottom: 0.5rem; &:hover { background: var(--border); }
    }
    .email { color: var(--text-muted); }
    .balance-card { text-align: center; }
    .balance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .balance-amount { font-size: 3rem; font-weight: 700; color: var(--secondary); margin: 1rem 0; }
    .cred-level { color: var(--text-muted); margin-bottom: 1.5rem; }
    .topup-form { display: flex; gap: 1rem; }
    .topup-form input { flex: 1; }
    .transactions { margin-top: 2rem; }
    .transactions h3 { margin-bottom: 1rem; }
    .tx-item { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border); }
    .tx-info { display: flex; flex-direction: column; }
    .tx-merchant { font-weight: 500; }
    .tx-date { font-size: 0.875rem; color: var(--text-muted); }
    .tx-amount { color: var(--error); font-weight: 600; }
    .no-tx { color: var(--text-muted); text-align: center; padding: 2rem; }
  `]
})
export class WalletComponent implements OnInit {
  private api = inject(ApiService);

  // Signals for zoneless change detection
  users = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  transactions = signal<Transaction[]>([]);

  // Form fields
  topupAmount = 25;
  newUserEmail = '';
  newUserFirstName = '';
  newUserLastName = '';
  newUserPassword = '';

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.api.getUsers().subscribe(users => this.users.set(users));
  }

  selectUser(user: User) {
    this.selectedUser.set(user);
    this.api.getTransactions().subscribe(txs => {
      this.transactions.set(txs.filter(tx => tx.fromUser?.id === user.id));
    });
  }

  clearSelectedUser() {
    this.selectedUser.set(null);
  }

  createUser() {
    const newUser = {
      email: this.newUserEmail,
      firstName: this.newUserFirstName,
      lastName: this.newUserLastName,
      password: this.newUserPassword
    };
    this.api.createUser(newUser).subscribe(user => {
      this.users.update(users => [...users, user]);
      this.selectUser(user);
      this.newUserEmail = '';
      this.newUserFirstName = '';
      this.newUserLastName = '';
      this.newUserPassword = '';
    });
  }

  topup() {
    const user = this.selectedUser();
    if (!user) return;
    this.api.topup(user.id, this.topupAmount).subscribe(balance => {
      this.selectedUser.update(u => u ? { ...u, balance } : null);
    });
  }
}

