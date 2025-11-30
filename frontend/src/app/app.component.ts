import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-icon">💳</span>
          <span class="logo-text">Credchit</span>
        </a>
        <nav class="nav-links">
          <a routerLink="/wallet">Wallet</a>
          <a routerLink="/merchants">Merchants</a>
          <a routerLink="/pay">Pay</a>
        </nav>
      </div>
    </header>
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      text-decoration: none;
    }
    .logo-icon { font-size: 1.75rem; }
    .nav-links {
      display: flex;
      gap: 2rem;
    }
    .nav-links a {
      color: var(--text-muted);
      font-weight: 500;
      text-decoration: none;
      &:hover { color: var(--text); }
    }
    main {
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {}

