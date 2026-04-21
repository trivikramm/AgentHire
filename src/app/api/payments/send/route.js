import { NextResponse } from 'next/server';
import { sendNanopayment } from '@/lib/circle';

export async function POST(request) {
  try {
    const { fromWalletId, toAddress, amount, memo } = await request.json();

    if (!toAddress || !amount) {
      return NextResponse.json({ error: 'toAddress and amount are required' }, { status: 400 });
    }

    const result = await sendNanopayment(fromWalletId, toAddress, amount, memo);

    return NextResponse.json({ success: true, transaction: result });
  } catch (error) {
    console.error('Payment send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}