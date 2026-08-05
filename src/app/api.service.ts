import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { Observable, map, timeout } from 'rxjs';

interface LatexfRuntimeConfig { apiBaseUrl?: string; }

declare global {
  interface Window { __LATEXF_CONFIG__?: LatexfRuntimeConfig; }
}

export interface UserProfile { mobileNumber: string; name: string; address?: string; state?: string; district?: string; pincode?: string; subscriptionActive?: boolean; subscriptionEndDate?: string; smsAlertEnabled?: boolean; }
export interface RubberPrice { id: number; priceDate: string; quality: string; price: number; }
export interface PaymentPlan { amount?: number; price?: number; currency?: string; name?: string; duration?: string; [key: string]: unknown; }
export interface PaymentStatus { status?: 'S' | 'P' | 'F' | string; paymentReference?: string; transactionRef?: string; remarks?: string; [key: string]: unknown; }
export interface CashfreeOrder { orderId?: string; order_id?: string; paymentSessionId?: string; payment_session_id?: string; cashfreeOrderId?: string; subscriptionStatus?: string; [key: string]: unknown; }
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveBaseUrl();
  private readonly sessionKey = 'latexb-session-id';
  private readonly pendingKey = 'latexb-payment-pending';
  private readonly orderKey = 'latexf-payment-order-id';
  private readonly profileKey = 'latexf-profile';
  private readonly requestTimeoutMs = 45000;
  private headers(): HttpHeaders { const id = localStorage.getItem(this.sessionKey); return id ? new HttpHeaders({ 'X-Session-Id': id }) : new HttpHeaders(); }
  register(body: object): Observable<unknown> { return this.withTimeout(this.http.post(`${this.baseUrl}/auth/register`, body)); }
  login(body: object): Observable<any> { return this.withTimeout(this.http.post(`${this.baseUrl}/auth/login`, body)); }
  profile(): Observable<UserProfile> { return this.withTimeout(this.http.get<UserProfile | { data: UserProfile }>(`${this.baseUrl}/user/profile`, { headers: this.headers() })).pipe(map((response) => this.unwrap(response))); }
  todayPrice(): Observable<RubberPrice[]> { return this.withTimeout(this.http.get<RubberPrice[] | { data: RubberPrice[] }>(`${this.baseUrl}/price/today`, { headers: this.headers() })).pipe(map((response) => this.unwrap(response))); }
  monthlyPrices(year: number, month: number): Observable<RubberPrice[]> { return this.withTimeout(this.http.get<RubberPrice[] | { data: RubberPrice[] }>(`${this.baseUrl}/price/monthly?year=${year}&month=${month}`, { headers: this.headers() })).pipe(map((response) => this.unwrap(response))); }
  subscriptionPlan(): Observable<PaymentPlan> { return this.withTimeout(this.http.get<PaymentPlan | { data: PaymentPlan }>(`${this.baseUrl}/payment/plan`, { headers: this.headers() })).pipe(map((response) => this.unwrap(response))); }
  createPaymentOrder(body: { gateway: string; mobileNumber: string }): Observable<any> { return this.withTimeout(this.http.post(`${this.baseUrl}/payment/create-order`, body, { headers: this.headers() })); }
  verifyPayment(body: { gatewayPaymentId: string; remarks: string }): Observable<any> { return this.withTimeout(this.http.post(`${this.baseUrl}/payment/verify`, body, { headers: this.headers() })); }
  submitPayment(body: { transactionRef: string; remarks: string }): Observable<any> { return this.withTimeout(this.http.post(`${this.baseUrl}/payment/submit`, body, { headers: this.headers() })); }
  paymentStatus(): Observable<PaymentStatus> { return this.withTimeout(this.http.get<PaymentStatus | { data: PaymentStatus }>(`${this.baseUrl}/payment/status`, { headers: this.headers() })).pipe(map((response) => this.extractPaymentStatus(response))); }
  adminVerifyPayment(body: { paymentReference: string; status: 'S' | 'P' | 'F'; remarks: string }): Observable<any> { return this.withTimeout(this.http.post(`${this.baseUrl}/payment/admin/verify`, body, { headers: this.headers() })); }
  recentPricesAndPrediction(): Observable<any> { return this.withTimeout(this.http.get(`${this.baseUrl}/price/recent-and-prediction`, { headers: this.headers() })); }
  logout(): Observable<unknown> { return this.withTimeout(this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers: this.headers() })); }
  expireOnReload(): Observable<unknown> {
    const headers = this.headers();
    this.clearSession();
    return this.withTimeout(this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers }));
  }
  saveSession(response: any): void {
    const id = response?.sessionId || response?.sessionID || response?.session_id
      || response?.data?.sessionId || response?.data?.sessionID || response?.data?.session_id
      || response?.session?.id || response?.data?.session?.id || response?.id;
    if (id) localStorage.setItem(this.sessionKey, String(id));
  }
  hasSession(): boolean { return !!localStorage.getItem(this.sessionKey); }
  clearSession(): void { localStorage.removeItem(this.sessionKey); localStorage.removeItem(this.pendingKey); localStorage.removeItem(this.orderKey); localStorage.removeItem(this.profileKey); }
  saveProfile(profile: UserProfile): void { localStorage.setItem(this.profileKey, JSON.stringify(profile)); }
  cachedProfile(): UserProfile | null { try { const value = localStorage.getItem(this.profileKey); return value ? JSON.parse(value) as UserProfile : null; } catch { return null; } }
  saveOrderId(response: any): void {
    const id = response?.orderId || response?.order_id || response?.id || response?.data?.orderId || response?.data?.order_id || response?.data?.id;
    if (id) localStorage.setItem(this.orderKey, String(id));
  }
  orderId(): string { return localStorage.getItem(this.orderKey) || ''; }
  extractPaymentStatus(response: any): PaymentStatus {
    const value = response?.data ?? response ?? {};
    if (typeof value === 'string') return { status: value };
    return { ...value, status: value.status ?? value.subscriptionStatus ?? value.paymentStatus ?? value.payment_status };
  }
  setPaymentPending(): void { localStorage.setItem(this.pendingKey, 'true'); }
  clearPaymentPending(): void { localStorage.removeItem(this.pendingKey); }
  paymentPending(): boolean { return localStorage.getItem(this.pendingKey) === 'true'; }
  private resolveBaseUrl(): string {
    const configured = window.__LATEXF_CONFIG__?.apiBaseUrl?.trim().replace(/\/+$/, '');
    if (configured) return configured.endsWith('/api/v1') ? configured : `${configured}/api/v1`;
    return Capacitor.isNativePlatform() ? 'http://10.0.2.2:8080/api/v1' : '/api/v1';
  }
  private unwrap<T>(response: T | { data: T }): T { return (response && typeof response === 'object' && 'data' in response) ? response.data : response as T; }
  private withTimeout<T>(request: Observable<T>): Observable<T> { return request.pipe(timeout({ each: this.requestTimeoutMs })); }
}
