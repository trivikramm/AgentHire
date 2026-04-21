import { NextResponse } from 'next/server';
import { getBalance } from '@/lib/circle';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const walletId = searchParams.get('walletId');

  if (!walletId) {
    return NextResponse.json({ error: 'walletId is required' }, { status: 400 });
  }

  try {
    const balances = await getBalance(walletId);
    return NextResponse.json({ balances });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}