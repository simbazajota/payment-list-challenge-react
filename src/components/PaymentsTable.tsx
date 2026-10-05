import { I18N } from "../constants/i18n";
import type { Payment } from "../types/payment";
import { formatAmount, formatDate } from "../utils/format";
import {
  StatusBadge,
  Table,
  TableBodyWrapper,
  TableCell,
  TableHeader,
  TableHeaderRow,
  TableHeaderWrapper,
  TableRow,
} from "./components";

// keep this in the same order as the cells below
const COLUMNS = [
  I18N.TABLE_HEADER_PAYMENT_ID,
  I18N.TABLE_HEADER_DATE,
  I18N.TABLE_HEADER_AMOUNT,
  I18N.TABLE_HEADER_CUSTOMER,
  I18N.TABLE_HEADER_CURRENCY,
  I18N.TABLE_HEADER_STATUS,
];

interface PaymentsTableProps {
  payments: Payment[];
}

export const PaymentsTable = ({ payments }: PaymentsTableProps) => (
  <Table>
    <TableHeaderWrapper>
      <TableHeaderRow>
        {COLUMNS.map((column) => (
          <TableHeader key={column} scope="col">
            {column}
          </TableHeader>
        ))}
      </TableHeaderRow>
    </TableHeaderWrapper>
    <TableBodyWrapper>
      {payments.map((payment) => (
        // id as the key, not the index
        <TableRow key={payment.id}>
          <TableCell>{payment.id}</TableCell>
          <TableCell>{formatDate(payment.date)}</TableCell>
          <TableCell>{formatAmount(payment.amount)}</TableCell>
          <TableCell>{payment.customerName || I18N.EMPTY_CUSTOMER}</TableCell>
          <TableCell>{payment.currency || I18N.EMPTY_CURRENCY}</TableCell>
          <TableCell>
            <StatusBadge status={payment.status}>{payment.status}</StatusBadge>
          </TableCell>
        </TableRow>
      ))}
    </TableBodyWrapper>
  </Table>
);
