import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPayments } from '../api/payments';
import type { PaymentSearchParams } from '../types/payment';

export const usePayments = (params: PaymentSearchParams) =>
  useQuery({
    // params are in the key so any change refetches, and every filter/page
    // combo gets cached on its own
    queryKey: ['payments', params],
    queryFn: () => fetchPayments(params),
    // keep showing the current page while the next one loads
    placeholderData: keepPreviousData,
  });
