export type PaymentStatus = "completed" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  customerName: string;
  amount: number;
  customerAddress: string;
  currency: string;
  status: PaymentStatus;
  date: string;
  description: string;
  clientId?: string; // in the readme example but none of the mock data has it
}

export interface PaymentSearchParams {
  search: string;
  currency: string;
  page: number;
  pageSize: number;
}

// stuff the user controls, page size is fixed by us
export type PaymentQuery = Omit<PaymentSearchParams, "pageSize">;

export interface PaymentSearchResponse {
  payments: Payment[];
  total: number;
  page: number;
  pageSize: number;
}
