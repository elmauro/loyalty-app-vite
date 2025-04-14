import React from 'react';
import { Transaction } from '../../types/Transaction';
import styles from './TransactionTable.module.scss';

interface Props {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: Props) {
  return (
    <table className={styles.transactionTable}>
      <thead>
        <tr>
          <th>Detail</th>
          <th>Transaction Date</th>
          <th>Points</th>
        </tr>
      </thead>
      <tbody>
        {transactions?.map((tx) => (
          <tr key={tx.id}>
            <td>{tx.detail}</td>
            <td>{tx.transactionDate}</td>
            <td>{tx.type === 'sale' ? `- ${tx.points}` : `+ ${tx.points}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
