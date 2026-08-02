declare interface CashfreeCheckout {
  checkout(options: { paymentSessionId: string; redirectTarget?: '_self' | '_blank' | '_modal' }): Promise<unknown>;
}

declare function Cashfree(options: { mode: 'sandbox' | 'production' }): CashfreeCheckout;
