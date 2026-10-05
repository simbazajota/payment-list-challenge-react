import axios from "axios";
import { API_URL } from "../constants";
import type { PaymentSearchParams, PaymentSearchResponse } from "../types/payment";

export const fetchPayments = async (
  params: PaymentSearchParams,
): Promise<PaymentSearchResponse> => {
  const { data } = await axios.get<PaymentSearchResponse>(API_URL, { params });
  return data;
};
