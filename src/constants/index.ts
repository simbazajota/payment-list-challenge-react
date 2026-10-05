import type { PaymentQuery } from "../types/payment";

export const API_URL = "/api/payments";

export const CURRENCIES = [
  "USD", "EUR", "GBP", "AUD", "CAD", "ZAR", "JPY", "CZK"
];

// used for the first render and for Clear Filters
export const INITIAL_QUERY: PaymentQuery = { search: "", currency: "", page: 1 };

// always send this, the mock server defaults to 10 if you leave it out
export const PAGE_SIZE = 5;
