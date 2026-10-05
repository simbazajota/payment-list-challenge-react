import { useState } from "react";
import { I18N } from "../constants/i18n";
import { INITIAL_QUERY, PAGE_SIZE } from "../constants";
import type { PaymentQuery } from "../types/payment";
import { usePayments } from "../hooks/usePayments";
import { getErrorMessage } from "../utils/errors";
import { Pagination } from "./Pagination";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentsTable } from "./PaymentsTable";
import {
  Container,
  EmptyBox,
  ErrorBox,
  Spinner,
  TableWrapper,
  Title,
} from "./components";

export const PaymentsPage = () => {
  // searchInput is whatever's typed in the box, query is what we actually send to the api
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState<PaymentQuery>(INITIAL_QUERY);

  // worked out each render instead of stored in state so it can't go out of sync.
  // counts the typed text too so you can clear something you haven't searched yet
  const hasActiveFilters =
    searchInput !== "" || query.search !== "" || query.currency !== "";

  // any filter change goes back to page 1 so we don't end up on a page that doesn't exist.
  // using the (current) => form so a quick search + currency change don't overwrite each other
  const handleSearch = () =>
    setQuery((current) => ({
      ...current,
      search: searchInput.trim(),
      page: 1,
    }));

  const handleCurrencyChange = (currency: string) =>
    setQuery((current) => ({ ...current, currency, page: 1 }));

  // resetting query refetches the full list on its own, no extra search needed
  const handleClear = () => {
    setSearchInput("");
    setQuery(INITIAL_QUERY);
  };

  const handlePrevious = () =>
    setQuery((current) => ({ ...current, page: current.page - 1 }));

  const handleNext = () =>
    setQuery((current) => ({ ...current, page: current.page + 1 }));

  const { data, error, isPending, isError } = usePayments({
    ...query,
    pageSize: PAGE_SIZE,
  });

  // loading / error / empty all sit outside the <table> so it only ever has payment rows.
  // data is definitely there once we get past the checks below
  const renderContent = () => {
    if (isPending) {
      return <Spinner role="status" aria-label="Loading" />;
    }
    if (isError) {
      return <ErrorBox role="alert">{getErrorMessage(error)}</ErrorBox>;
    }
    // shouldn't really happen, the mock api sends a 404 for empty searches
    if (data.payments.length === 0) {
      return <EmptyBox>{I18N.NO_PAYMENTS_FOUND}</EmptyBox>;
    }
    return (
      <TableWrapper>
        <PaymentsTable payments={data.payments} />
        <Pagination
          page={query.page}
          hasPrevious={query.page > 1}
          // total = how many matches the server has overall
          hasNext={query.page * PAGE_SIZE < data.total}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </TableWrapper>
    );
  };

  return (
    <Container>
      <Title>{I18N.PAGE_TITLE}</Title>
      <PaymentFilters
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onSearch={handleSearch}
        currency={query.currency}
        onCurrencyChange={handleCurrencyChange}
        hasActiveFilters={hasActiveFilters}
        onClear={handleClear}
      />
      {renderContent()}
    </Container>
  );
};
