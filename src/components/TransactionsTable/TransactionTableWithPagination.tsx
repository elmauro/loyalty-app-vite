import React from 'react';
import { Transaction } from '../../types/Transaction';
import TransactionTable from './TransactionTable';
import { TablePaginationBar } from '@/components/ui/table-pagination-bar';

interface Props {
  /** Transacciones de la página actual (del backend) */
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  /** true mientras se carga otra página o se cambia el tamaño */
  isLoading?: boolean;
  /** Listado por tenant: mostrar columna de documento */
  showDocumentColumn?: boolean;
}

export default function TransactionTableWithPagination({
  data,
  total,
  page,
  limit,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showDocumentColumn = false,
}: Props) {
  if (!data || data.length === 0) {
    return <TransactionTable transactions={[]} showDocumentColumn={showDocumentColumn} />;
  }

  return (
    <div className="space-y-4">
      <TransactionTable transactions={data} showDocumentColumn={showDocumentColumn} />

      <TablePaginationBar
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={isLoading}
        idPrefix="tx"
      />
    </div>
  );
}
