import axios from "axios";
import { I18N } from "../constants/i18n";

// anything we don't specifically handle (other status codes, no response at all,
// random errors) just gets the generic message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 404:
        return I18N.PAYMENT_NOT_FOUND;
      case 500:
        return I18N.INTERNAL_SERVER_ERROR;
    }
  }
  return I18N.SOMETHING_WENT_WRONG;
};
