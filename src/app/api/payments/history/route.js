import { NextResponse } from 'next/server';
import { getTransactionLog } from '@/lib/agents';

export async function GET() {
  const transactions = getTransactionLog();
  return NextResponse.json({
    transactions,
    total: transactions.length,
    totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
  });
}
