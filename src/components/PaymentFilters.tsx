import type { FormEvent } from "react";
import { CURRENCIES } from "../constants";
import { I18N } from "../constants/i18n";
import {
  ClearButton,
  FilterRow,
  SearchButton,
  SearchInput,
  Select,
} from "./components";

interface PaymentFiltersProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export const PaymentFilters = ({
  searchValue,
  onSearchValueChange,
  onSearch,
  currency,
  onCurrencyChange,
  hasActiveFilters,
  onClear,
}: PaymentFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // stops the page doing a full reload on submit
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} role="search">
      <FilterRow>
        <SearchInput
          type="search"
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder={I18N.SEARCH_PLACEHOLDER}
          // no visible label, so aria-label gives it a name (placeholder doesn't count)
          aria-label={I18N.SEARCH_LABEL}
        />
        {/* currency applies straight away, search waits for the button */}
        <Select
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
          aria-label={I18N.CURRENCY_FILTER_LABEL}
        >
          {/* empty value = no currency filter */}
          <option value="">{I18N.CURRENCIES_OPTION}</option>
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Select>
        <SearchButton type="submit">{I18N.SEARCH_BUTTON}</SearchButton>
        {hasActiveFilters && (
          // type="button" or it'd submit the form
          <ClearButton type="button" onClick={onClear}>
            {I18N.CLEAR_FILTERS}
          </ClearButton>
        )}
      </FilterRow>
    </form>
  );
};
