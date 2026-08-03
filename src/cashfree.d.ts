declare module '@cashfreepayments/cashfree-js' {
  export interface CashfreeCheckout {
    checkout(options: {
      paymentSessionId: string;
      redirectTarget?: '_self' | '_blank' | '_modal';
    }): Promise<unknown>;
  }

  export function load(options: { mode: 'sandbox' | 'production' }): Promise<CashfreeCheckout | null>;
}
