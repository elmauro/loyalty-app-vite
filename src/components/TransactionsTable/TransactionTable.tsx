import React from 'react';
import { Transaction } from '../../types/Transaction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TransactionTable({ transactions }: Props) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No se encontraron transacciones</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Detail</TableHead>
            <TableHead className="font-semibold">Transaction Date</TableHead>
            <TableHead className="font-semibold text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{tx.detail}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(tx.transactionDate)}</TableCell>
              <TableCell className="text-right">
                <span className={tx.type === 'redemption' ? 'points-negative' : 'points-positive'}>
                  {tx.type === 'redemption' ? '-' : '+'} {Math.abs(tx.points).toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
