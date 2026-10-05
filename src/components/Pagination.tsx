import { I18N } from "../constants/i18n";
import { PaginationButton, PaginationRow } from "./components";

interface PaginationProps {
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const Pagination = ({
  page,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: PaginationProps) => (
  <PaginationRow>
    <PaginationButton
      type="button"
      onClick={onPrevious}
      disabled={!hasPrevious}
    >
      {I18N.PREVIOUS_BUTTON}
    </PaginationButton>
    {/* screen readers announce the page number when it changes */}
    <span aria-live="polite">
      {I18N.PAGE_LABEL} {page}
    </span>
    <PaginationButton type="button" onClick={onNext} disabled={!hasNext}>
      {I18N.NEXT_BUTTON}
    </PaginationButton>
  </PaginationRow>
);
