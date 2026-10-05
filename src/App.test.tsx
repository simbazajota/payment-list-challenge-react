import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import { server } from "./mocks/node";
import App from "./App";
import { I18N } from "./constants/i18n";
import { format } from 'date-fns';

// Helper function to robustly check for error messages with better debugging
export const waitForErrorMessage = async (expectedMessage: string, timeout = 10000) => {
  try {
    await waitFor(() => {
      expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    }, { timeout });
  } catch {
    // If the expected message isn't found, let's see what error messages are actually on the page
    const errorElements = screen.queryAllByText(/error|not found|server/i);
    const errorTexts = errorElements.map(el => el.textContent).filter(Boolean);
    
    throw new Error(
      `Expected error message "${expectedMessage}" not found. ` +
      `Available error-related text: ${errorTexts.join(', ') || 'None found'}`
    );
  }
};

export const getTableCellsByColumnName = (columnName: string, rowIndex: number) => {
  const headers = screen.getAllByRole('columnheader');

  const columnIndex = headers.findIndex((header) =>
    (header?.textContent || '').includes(columnName),
  );

  if (columnIndex === -1) {
    throw new Error(`Column name not found`);
  }

  const rows = screen.getAllByRole('row').slice(1);

  if (rowIndex !== null) {
    const cells = rows[rowIndex]?.querySelectorAll('td');
    return cells?.[columnIndex];
  } else {
    throw new Error(`Row not found`);
  }
};


export const formattedDate = (date: string) => {
  return format(new Date(date), "dd/MM/yyyy, HH:mm:ss")
};

export const getSearchInput = () => {
  // Try to find by placeholder first, then by role with name
  try {
    return screen.getByPlaceholderText(I18N.SEARCH_PLACEHOLDER);
  } catch {
    return screen.getByRole("searchbox", { name: I18N.SEARCH_LABEL });
  }
};

// grabs one whole column of the table body, top to bottom
const getColumn = (columnName: string) => {
  const bodyRows = screen.getAllByRole("row").slice(1); // skip the header row
  return bodyRows.map((_, rowIndex) => getTableCellsByColumnName(columnName, rowIndex)?.textContent);
};

beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

describe("App - Step 1: Basic Payment List", () => {
  test("should fetch and display payments in a table with page=1 and pageSize=5", async () => {
    render(<App />);

    // Wait for the table to load with data cells
    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("cell").length).toBeGreaterThan(0);
    });

    // Check that table headers are displayed using i18n strings
    expect(screen.getByText(I18N.TABLE_HEADER_PAYMENT_ID)).toBeInTheDocument();
    expect(screen.getByText(I18N.TABLE_HEADER_DATE)).toBeInTheDocument();
    expect(screen.getByText(I18N.TABLE_HEADER_AMOUNT)).toBeInTheDocument();
    expect(screen.getByText(I18N.TABLE_HEADER_CUSTOMER)).toBeInTheDocument();
    expect(screen.getByText(I18N.TABLE_HEADER_CURRENCY)).toBeInTheDocument();
    expect(screen.getByText(I18N.TABLE_HEADER_STATUS)).toBeInTheDocument();

    // Check that 5 payments are displayed (pageSize=5)
    const tableRows = screen.getAllByRole("row");
    expect(tableRows).toHaveLength(6); // 1 header row + 5 data rows

    // first row has the right stuff in each column, and every amount is to 2 decimals
    expect(getColumn(I18N.TABLE_HEADER_PAYMENT_ID)[0]).toBe("pay_134_1");
    expect(getColumn(I18N.TABLE_HEADER_DATE)[0]).toBe(formattedDate("2024-04-15T10:00:00Z"));
    expect(getColumn(I18N.TABLE_HEADER_CUSTOMER)[0]).toBe("Alice Green");
    expect(getColumn(I18N.TABLE_HEADER_CURRENCY)[0]).toBe("USD");
    expect(getColumn(I18N.TABLE_HEADER_STATUS)[0]).toBe("completed");
    expect(getColumn(I18N.TABLE_HEADER_AMOUNT)).toEqual(["250.00", "150.50", "120.75", "200.00", "85.25"]);
  });
});

describe("App - Step 2: Search by Payment ID", () => {
  test("should have a search input for payment ID", () => {
    render(<App />);

    const searchInput = getSearchInput();
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("placeholder", I18N.SEARCH_PLACEHOLDER);
    // needs a proper accessible name too, not just a placeholder
    expect(screen.getByRole("searchbox", { name: I18N.SEARCH_LABEL })).toBeInTheDocument();
  });

  test("should search for payments by payment ID", async () => {
    render(<App />);

    const searchInput = getSearchInput();
    const searchButton = screen.getByRole("button", { name: I18N.SEARCH_BUTTON });

    fireEvent.change(searchInput, { target: { value: "pay_134_1" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("pay_134_1")).toBeInTheDocument();
      // pay_134_1 is also the first row before searching, so check it's the only one left
      expect(screen.getAllByRole("row")).toHaveLength(2); // header + 1 row
    });
  });
});

describe("App - Step 3: Clear Filters", () => {
  test("should clear all filters when clear button is clicked", async () => {
    render(<App />);

    const searchInput = getSearchInput();
    const searchButton = screen.getByRole("button", { name: I18N.SEARCH_BUTTON });

    // nothing filtered yet so there shouldn't be a clear button
    expect(screen.queryByRole("button", { name: I18N.CLEAR_FILTERS })).not.toBeInTheDocument();

    // Perform a search
    fireEvent.change(searchInput, { target: { value: "pay_134_1" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("pay_134_1")).toBeInTheDocument();
      expect(screen.getAllByRole("row")).toHaveLength(2); // header + 1 row, so the search has applied
    });

    // Clear filters
    const clearButton = screen.getByRole("button", { name: I18N.CLEAR_FILTERS });
    fireEvent.click(clearButton);

    // Check that search input is cleared
    expect(searchInput).toHaveValue("");

    // full list comes back and the clear button goes away again
    await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));
    expect(screen.queryByRole("button", { name: I18N.CLEAR_FILTERS })).not.toBeInTheDocument();
  });
});

describe("App - Step 4: Handle Payment Not Found", () => {
  test("should display error message when payment ID is not found", async () => {
    render(<App />);

    const searchInput = getSearchInput();
    const searchButton = screen.getByRole("button", { name: I18N.SEARCH_BUTTON });

    fireEvent.change(searchInput, { target: { value: "pay_404" } });
    fireEvent.click(searchButton);

    await waitForErrorMessage(I18N.PAYMENT_NOT_FOUND);

    // error should replace the table
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});

describe("App - Step 5: Handle Server Error", () => {
  test("should display error message when API returns 500", async () => {
    render(<App />);

    const searchInput = getSearchInput();
    const searchButton = screen.getByRole("button", { name: I18N.SEARCH_BUTTON });

    fireEvent.change(searchInput, { target: { value: "pay_500" } });
    fireEvent.click(searchButton);

    await waitForErrorMessage(I18N.INTERNAL_SERVER_ERROR);

    // replaces the table, and it's not the 404 message
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(I18N.PAYMENT_NOT_FOUND)).not.toBeInTheDocument();
  });
});

describe("App - Step 6: Currency Filter", () => {
  test("should have a currency filter dropdown", () => {
    render(<App />);

    const currencySelect = screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL });
    expect(currencySelect).toBeInTheDocument();

    // all the readme currencies are in there and nothing is picked by default
    for (const currency of ["USD", "EUR", "GBP", "AUD", "CAD", "ZAR"]) {
      expect(within(currencySelect).getByRole("option", { name: currency })).toBeInTheDocument();
    }
    expect(currencySelect).toHaveDisplayValue(I18N.CURRENCIES_OPTION);
  });

  test("should filter payments by currency when selected", async () => {
    render(<App />);

    const currencySelect = screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL });

    fireEvent.change(currencySelect, { target: { value: "USD" } });

    // every row has to be USD. (just looking for the text "USD" would also match the dropdown option)
    await waitFor(() => {
      const currencies = getColumn(I18N.TABLE_HEADER_CURRENCY);
      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies.every((currency) => currency === "USD")).toBe(true);
    });

    // clear filters should reset the dropdown too
    fireEvent.click(screen.getByRole("button", { name: I18N.CLEAR_FILTERS }));
    expect(currencySelect).toHaveDisplayValue(I18N.CURRENCIES_OPTION);
  });
});

describe("App - Step 7: Combined Currency and Payment ID Filter", () => {
  test("should filter by both currency and payment ID", async () => {
    render(<App />);

    const searchInput = getSearchInput();
    const searchButton = screen.getByRole("button", { name: I18N.SEARCH_BUTTON });
    const currencySelect = screen.getByRole("combobox", { name: I18N.CURRENCY_FILTER_LABEL });

    // Search for a specific payment
    fireEvent.change(searchInput, { target: { value: "pay_134" } });
    fireEvent.click(searchButton);

    // Filter by currency
    fireEvent.change(currencySelect, { target: { value: "USD" } });

    await waitFor(() => {
      // Should show payments that match both criteria. pay_134_1 is the only
      // pay_134 payment that's in USD
      expect(getColumn(I18N.TABLE_HEADER_PAYMENT_ID)).toEqual(["pay_134_1"]);
    });
  });
});

describe("App - Step 8: Pagination", () => {
  test("should display pagination controls", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("cell").length).toBeGreaterThan(0);
    });

    // Check for pagination buttons
    expect(screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: I18N.NEXT_BUTTON })).toBeInTheDocument();
    expect(screen.getByText(`${I18N.PAGE_LABEL} 1`)).toBeInTheDocument();
  });

  test("should disable previous button on first page", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByRole("cell").length).toBeGreaterThan(0);
    });

    const previousButton = screen.getByRole("button", { name: I18N.PREVIOUS_BUTTON });
    expect(previousButton).toBeDisabled();

    // next page: different payments, and previous is enabled now
    const firstPageIds = getColumn(I18N.TABLE_HEADER_PAYMENT_ID);
    fireEvent.click(screen.getByRole("button", { name: I18N.NEXT_BUTTON }));
    await screen.findByText(`${I18N.PAGE_LABEL} 2`);
    await waitFor(() =>
      expect(getColumn(I18N.TABLE_HEADER_PAYMENT_ID)).not.toEqual(firstPageIds),
    );
    expect(previousButton).toBeEnabled();

    // and back to the first page again
    fireEvent.click(previousButton);
    await waitFor(() =>
      expect(getColumn(I18N.TABLE_HEADER_PAYMENT_ID)).toEqual(firstPageIds),
    );
    expect(previousButton).toBeDisabled();
  });
});
