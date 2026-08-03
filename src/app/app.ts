import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { load } from '@cashfreepayments/cashfree-js';
import { ApiService, CashfreeOrder, PaymentPlan, PaymentStatus, RubberPrice, UserProfile } from './api.service';
import { Language, LanguageService } from './language.service';
import { TranslatePipe } from './translate.pipe';

type View = 'auth' | 'home' | 'payment' | 'monthly';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, MatSnackBarModule, MatTabsModule, TranslatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly snack = inject(MatSnackBar);
  readonly language = inject(LanguageService);

  readonly view = signal<View>('auth');
  readonly authTab = signal(0);
  readonly loading = signal(false);
  readonly profile = signal<UserProfile | null>(null);
  readonly prices = signal<RubberPrice[]>([]);
  readonly monthlyPrices = signal<RubberPrice[]>([]);
  readonly monthlyYear = signal(new Date().getFullYear());
  readonly monthlyMonth = signal(new Date().getMonth() + 1);
  readonly paymentSubmitted = signal(false);
  readonly paymentPlan = signal<PaymentPlan | null>(null);
  readonly paymentStatus = signal<PaymentStatus | null>(null);
  readonly recentPrediction = signal<any>(null);
  readonly cashfreeOrder = signal<CashfreeOrder | null>(null);
  readonly paymentSessionId = signal('');
  readonly error = signal('');
  readonly whatsappNumber = '919842630047';
  readonly whatsappMessage = 'I am planning to sell rubber sheets';
  private readonly inactivityLimitMs = 15 * 60 * 1000;
  private inactivityTimer?: ReturnType<typeof setTimeout>;

  readonly registerForm = this.fb.nonNullable.group({
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    name: ['', Validators.required], address: ['', Validators.required], state: ['', Validators.required],
    district: ['', Validators.required], pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });
  readonly loginForm = this.fb.nonNullable.group({ mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]] });
  readonly states = ['Tamil Nadu'];
  readonly districts = ['Kanyakumari'];

  ngOnInit(): void {
    if (this.api.hasSession()) {
      this.api.expireOnReload().subscribe({ error: () => undefined });
    }
  }

  ngOnDestroy(): void { this.stopInactivityTimer(); }

  @HostListener('document:click')
  @HostListener('document:keydown')
  @HostListener('document:touchstart')
  @HostListener('document:scroll')
  resetInactivityTimer(): void {
    if (this.api.hasSession()) this.startInactivityTimer();
  }

  register(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    this.api.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.authTab.set(0);
        this.loginForm.patchValue({ mobileNumber: this.registerForm.controls.mobileNumber.value });
        this.notify('Registration complete. You can log in now.');
      },
      error: (e) => this.fail(e, 'Registration could not be completed.')
    });
  }

  stateChanged(state: string): void {
    if (state === 'Tamil Nadu') this.registerForm.patchValue({ district: 'Kanyakumari' });
    else this.registerForm.patchValue({ district: '' });
  }

  login(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set('');
    this.api.login({ mobileNumber: this.loginForm.controls.mobileNumber.value, deviceName: 'Postman', appVersion: '1.0.0' }).subscribe({
      next: (response) => {
        this.api.saveSession(response);
        if (!this.api.hasSession()) {
          this.fail(null, 'Login succeeded but the server did not return a session ID.');
          return;
        }
        this.startInactivityTimer();
        this.view.set('home');
        this.loadAccount();
      },
      error: (e) => this.fail(e, 'Login failed. Check your mobile number and try again.')
    });
  }

  loadAccount(): void {
    this.view.set('home');
    this.loading.set(true);
    this.api.profile().subscribe({
      next: (profile) => { this.profile.set(profile); this.api.saveProfile(profile); this.view.set('home'); this.loadSubscriptionAndPrice(); },
      error: (e) => {
        const status = e?.status;
        if (status === 401 || status === 403) {
          this.api.clearSession();
          this.profile.set(null);
          this.view.set('auth');
        }
        this.fail(e, 'Your session has expired. Please log in again.');
      }
    });
  }

  private loadSubscriptionAndPrice(): void {
    this.api.subscriptionPlan().subscribe({
      next: (plan) => {
        this.paymentPlan.set(plan);
        this.loadPriceIfAllowed();
      },
      error: () => this.loadPriceIfAllowed()
    });
  }

  private loadPriceIfAllowed(): void {
    if (!this.isSubscribed()) { this.loading.set(false); return; }
    this.api.todayPrice().subscribe({ next: (value) => { this.prices.set(value); this.loading.set(false); }, error: () => this.loading.set(false) });
    this.loadMonthlyPrices();
    this.api.recentPricesAndPrediction().subscribe({ next: (value) => this.recentPrediction.set(value), error: () => this.recentPrediction.set(null) });
  }

  openPayment(): void {
    this.view.set('payment');
    this.paymentSubmitted.set(false);
    this.paymentStatus.set(null);
    this.loading.set(true);
    this.api.subscriptionPlan().subscribe({
      next: (plan) => {
        this.paymentPlan.set(plan);
        this.api.createPaymentOrder({ gateway: 'CASHFREE', mobileNumber: this.profile()?.mobileNumber ?? '' }).subscribe({
          next: (response) => {
            const order = (response?.data ?? response) as CashfreeOrder;
            this.cashfreeOrder.set(order);
            this.paymentSessionId.set(String(order.paymentSessionId ?? ''));
            this.api.saveOrderId(order);
            this.loading.set(false);
          },
          error: (e) => this.fail(e, 'Unable to create the payment order.')
        });
      },
      error: (e) => this.fail(e, 'Unable to load the subscription plan.')
    });
  }

  async startCashfreeCheckout(): Promise<void> {
    if (!this.paymentSessionId()) { this.error.set('Cashfree payment session is not ready yet.'); return; }
    this.loading.set(true);
    try {
      const cashfree = await load({ mode: 'sandbox' });
      if (!cashfree) { this.loading.set(false); this.error.set('Cashfree checkout could not be loaded.'); return; }
      await cashfree.checkout({ paymentSessionId: this.paymentSessionId(), redirectTarget: '_modal' });
      // Cashfree has completed/closed the checkout. Let the backend confirm the
      // order, then continue through the same flow as “I’ve completed payment”.
      this.markPaymentDone();
    } catch {
      this.loading.set(false);
      this.error.set('Cashfree checkout could not be loaded. Please try again.');
    }
  }

  markPaymentDone(): void {
    this.loading.set(true);
    this.api.verifyPayment({ gatewayPaymentId: this.api.orderId(), remarks: 'Cashfree checkout completed' }).subscribe({
      next: (response) => {
        const status = this.api.extractPaymentStatus(response);
        this.paymentStatus.set(status);
        this.paymentPlan.update((plan) => ({ ...(plan ?? {}), ...status }));
        if (status.status === 'ACTIVE' || status.status === 'S' || (status as any).smsStatus === 'ACTIVE' || (status as any).rubberPriceEnabled === true) {
          this.paymentSubmitted.set(false);
          this.api.clearPaymentPending();
          this.loading.set(false);
          this.notify('Payment verified. Loading today’s price and enabling SMS alerts.');
          this.backToHome();
          this.loadAccount();
        } else {
          this.paymentSubmitted.set(true);
          this.api.setPaymentPending();
          this.loading.set(false);
          this.notify(status.status === 'F' ? 'Payment verification failed.' : 'Payment is pending verification.');
        }
      },
      error: (e) => this.fail(e, 'Unable to verify the payment. Please try again.')
    });
  }

  checkPaymentStatus(): void {
    this.api.paymentStatus().subscribe({
      next: (status) => {
        this.paymentStatus.set(status);
        if (status.status === 'S') {
          this.api.clearPaymentPending();
          this.notify('Payment verified. Your price and SMS access are now enabled.');
          this.backToHome();
          this.loadAccount();
        }
      },
      error: (e) => this.fail(e, 'Unable to check payment status.')
    });
  }

  backToHome(): void { this.view.set('home'); }
  openMonthlyPrices(): void { if (!this.isSubscribed()) return; this.view.set('monthly'); this.loadMonthlyPrices(); }
  loadMonthlyPrices(): void {
    this.loading.set(true);
    this.api.monthlyPrices(this.monthlyYear(), this.monthlyMonth()).subscribe({
      next: (prices) => { this.monthlyPrices.set(prices); this.loading.set(false); },
      error: (e) => this.fail(e, 'Unable to load monthly rubber prices.')
    });
  }
  changeMonthlyYear(value: string): void { this.monthlyYear.set(Number(value)); this.loadMonthlyPrices(); }
  changeMonthlyMonth(value: string): void { this.monthlyMonth.set(Number(value)); this.loadMonthlyPrices(); }

  logout(): void {
    this.api.logout().subscribe({ complete: () => this.finishLogout(), error: () => this.finishLogout() });
  }

  isSubscribed(): boolean {
    const profileActive = !!this.profile()?.subscriptionActive && !this.isExpired(this.profile()?.subscriptionEndDate);
    const plan = this.paymentPlan() as any;
    const planEnd = plan?.subscriptionEndDate ?? plan?.endDate;
    return profileActive || (this.planShowsActiveSubscription() && !this.isExpired(planEnd));
  }
  planShowsActiveSubscription(): boolean {
    const plan = this.paymentPlan() as any;
    const status = String(plan?.status ?? plan?.subscriptionStatus ?? plan?.paymentStatus ?? '').toUpperCase();
    return plan?.active === true || plan?.subscriptionActive === true || plan?.hasActiveSubscription === true
      || !!plan?.activeSubscription || ['ACTIVE', 'SUCCESS', 'S'].includes(status);
  }
  smsEnabled(): boolean {
    const plan = this.paymentPlan() as any;
    const smsStatus = String(plan?.smsStatus ?? plan?.sms_status ?? '').toUpperCase();
    return !!this.profile()?.smsAlertEnabled || plan?.smsAlertEnabled === true || smsStatus === 'ACTIVE';
  }
  planStatus(): string { const plan = this.paymentPlan() as any; return String(plan?.status ?? plan?.paymentStatus ?? plan?.payment_status ?? '').toUpperCase(); }
  hasPaymentRecord(): boolean {
    const plan = this.paymentPlan() as any;
    return !!plan && (!!this.planStatus() || !!plan.paymentReference || !!plan.paymentId || !!plan.subscriptionId || !!plan.subscription || !!plan.record);
  }
  isPlanPending(): boolean { return this.planStatus() === 'P'; }
  isPending(): boolean { return !this.isSubscribed() && (this.isPlanPending() || this.paymentSubmitted() || this.api.paymentPending()); }
  planAmount(): number { return 10; }
  planName(): string { const plan = this.paymentPlan() as any; return String(plan?.name ?? plan?.planName ?? 'Active subscription'); }
  priceDate(): string { return this.prices()[0]?.priceDate || ''; }
  sortedMonthlyPrices(): RubberPrice[] { return [...this.monthlyPrices()].sort((a, b) => a.price - b.price); }
  monthlyMaxPrice(): number { return Math.max(...this.monthlyPrices().map((item) => item.price), 1); }
  monthlyBarHeight(price: number): number { return Math.max((price / this.monthlyMaxPrice()) * 100, 8); }
  monthlyQualities(): string[] { return [...new Set(this.monthlyPrices().map((item) => item.quality))]; }
  monthlyTrend(quality: string): { direction: 'up' | 'down' | 'flat'; delta: number } {
    const values = this.monthlyPrices().filter((item) => item.quality === quality).sort((a, b) => a.priceDate.localeCompare(b.priceDate));
    if (values.length < 2) return { direction: 'flat', delta: 0 };
    const delta = Number((values[values.length - 1].price - values[0].price).toFixed(2));
    return { direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat', delta: Math.abs(delta) };
  }
  whatsappUrl(): string { return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.whatsappMessage)}`; }
  private isExpired(value: unknown): boolean { return typeof value === 'string' && !!value && new Date(value).getTime() < Date.now(); }
  expiryDate(): string {
    const value = this.profile()?.subscriptionEndDate || String((this.paymentPlan() as any)?.subscriptionEndDate ?? (this.paymentPlan() as any)?.endDate ?? '');
    return value ? this.formatDate(value) : '—';
  }
  formatDate(value: string): string { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }
  initials(): string { return (this.profile()?.name || 'J').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase(); }
  private startInactivityTimer(): void {
    this.stopInactivityTimer();
    this.inactivityTimer = setTimeout(() => {
      if (this.api.hasSession()) {
        this.notify('You were logged out due to inactivity.');
        this.logout();
      }
    }, this.inactivityLimitMs);
  }
  private stopInactivityTimer(): void { if (this.inactivityTimer) clearTimeout(this.inactivityTimer); this.inactivityTimer = undefined; }
  private finishLogout(): void { this.stopInactivityTimer(); this.api.clearSession(); this.profile.set(null); this.prices.set([]); this.monthlyPrices.set([]); this.view.set('auth'); this.notify('You have been logged out.'); }
  private notify(message: string): void { this.snack.open(message, 'Close', { duration: 4500, panelClass: ['latex-snack'] }); }
  private fail(error: any, fallback: string): void {
    this.loading.set(false);
    const serverMessage = error?.error?.message || error?.error?.error || error?.message;
    this.error.set(serverMessage || fallback);
  }
}
