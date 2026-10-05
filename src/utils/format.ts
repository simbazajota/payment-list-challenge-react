import { format } from "date-fns";

// new Date() turns the UTC time into the user's local time
export const formatDate = (isoDate: string): string =>
  format(new Date(isoDate), "dd/MM/yyyy, HH:mm:ss");

// 2 decimals, no symbol (currency has its own column). if this was real I'd use
// Intl.NumberFormat since stuff like JPY has no decimals
export const formatAmount = (amount: number): string => amount.toFixed(2);
