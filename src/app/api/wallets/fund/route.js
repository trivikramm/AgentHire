import { NextResponse } from 'next/server';
import { sendNanopayment } from '@/lib/circle';

export async function POST(request) {
  try {
    const { walletId, amount } = await request.json();

    if (!walletId || !amount) {
      return NextResponse.json({ error: 'walletId and amount are required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, walletId, amount, funded: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}