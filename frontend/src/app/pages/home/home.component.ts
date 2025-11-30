import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container">
      <section class="hero">
        <h1>Zero-Fee Payments. <span class="highlight">Instant.</span></h1>
        <p class="subtitle">
          ACH-backed balances, crypto-inspired speed. Pay merchants instantly with no fees.
        </p>
        <div class="cta-buttons">
          <a routerLink="/wallet" class="btn btn-primary">Open Wallet</a>
          <a routerLink="/merchants" class="btn btn-secondary">For Merchants</a>
        </div>
      </section>

      <section class="features">
        <div class="feature card">
          <div class="feature-icon">⚡</div>
          <h3>Instant Transfers</h3>
          <p>Internal ledger means payments settle in milliseconds, not days.</p>
        </div>
        <div class="feature card">
          <div class="feature-icon">🔒</div>
          <h3>Bank-Backed</h3>
          <p>Linked to your real ACH account. Auto-refill keeps you ready.</p>
        </div>
        <div class="feature card">
          <div class="feature-icon">💎</div>
          <h3>Cred Levels</h3>
          <p>Build your reputation with every transaction. Unlock rewards.</p>
        </div>
      </section>

      <section class="status card">
        <h3>System Status</h3>
        @if (health()) {
          <p class="status-ok">✅ {{ health()!.service }} - {{ health()!.status }}</p>
        } @else {
          <p class="status-loading">Checking API...</p>
        }
      </section>
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 4rem 0;
    }
    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .highlight { color: var(--primary); }
    .subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin: 4rem 0;
    }
    .feature {
      text-align: center;
    }
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .feature h3 {
      margin-bottom: 0.5rem;
    }
    .feature p {
      color: var(--text-muted);
    }
    .status {
      max-width: 400px;
      margin: 0 auto;
      text-align: center;
    }
    .status-ok { color: var(--success); }
    .status-loading { color: var(--text-muted); }
  `]
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);

  // Using signals for zoneless change detection
  health = signal<HealthStatus | null>(null);

  ngOnInit() {
    this.api.getHealth().subscribe({
      next: (data) => this.health.set(data),
      error: () => this.health.set(null),
    });
  }
}

