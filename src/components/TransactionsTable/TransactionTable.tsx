import React, { useState } from 'react';
import { Transaction } from '../../types/Transaction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  transactions: Transaction[];
}

export type TransactionFilter = 'all' | 'accumulation' | 'redemption';

/**
 * El backend devuelve points siempre positivos; type indica el tipo real.
 * Todo: acumulaciones, redenciones y expirados.
 * Acumulado: sale, income.
 * Redimido: redemption, expiration.
 */
function matchesFilter(t: Transaction, filter: TransactionFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'accumulation') return t.type === 'sale' || t.type === 'income';
  if (filter === 'redemption') return t.type === 'redemption' || t.type === 'expiration';
  return true;
}

function isRedemptionOrExpiration(t: Transaction): boolean {
  return t.type === 'redemption' || t.type === 'expiration';
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
  const [filter, setFilter] = useState<TransactionFilter>('all');

  const filtered = transactions.filter((t) => matchesFilter(t, filter));

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No se encontraron transacciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as TransactionFilter)}>
        <TabsList data-testid="tx-tabs">
          <TabsTrigger value="all" data-testid="tx-tab-all">Todo</TabsTrigger>
          <TabsTrigger value="accumulation" data-testid="tx-tab-accumulation">Acumulado</TabsTrigger>
          <TabsTrigger value="redemption" data-testid="tx-tab-redemption">Redimido</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Detalle</TableHead>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  No hay transacciones en esta categoría
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {tx.detail}
                      {tx.type === 'expiration' && (
                        <Badge
                          variant="outline"
                          className="text-warning border-warning/30 bg-warning/10 text-xs"
                          data-testid="tx-badge-vencido"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Vencido
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.transactionDate)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        tx.type === 'expiration'
                          ? 'text-warning font-semibold'
                          : isRedemptionOrExpiration(tx)
                            ? 'points-negative'
                            : 'points-positive'
                      }
                    >
                      {isRedemptionOrExpiration(tx) ? '-' : '+'} {Math.abs(tx.points).toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
