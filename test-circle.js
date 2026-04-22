import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
});

async function test() {
  // List all wallets
  console.log('\n=== WALLETS ===');
  const wallets = await client.listWallets({
    walletSetId: process.env.CIRCLE_WALLET_SET_ID,
  });

  for (const w of wallets.data?.wallets || []) {
    console.log(`Wallet: ${w.address} | Chain: ${w.blockchain} | ID: ${w.id}`);

    // Get balance
    try {
      const bal = await client.getWalletTokenBalance({ id: w.id });
      console.log('Balances:', JSON.stringify(bal.data?.tokenBalances, null, 2));
    } catch (e) {
      console.log('Balance error:', e.message);
    }
  }

  // Try a test transaction
  console.log('\n=== TEST TRANSFER ===');
  const walletsData = wallets.data?.wallets || [];

  if (walletsData.length >= 2) {
    const from = walletsData[0];
    const to = walletsData[1];

    console.log(`From: ${from.address} → To: ${to.address}`);

    // Try different token approaches
    const attempts = [
      {
        name: 'tokenAddress 0x3600...',
        params: {
          blockchain: from.blockchain,
          walletAddress: from.address,
          destinationAddress: to.address,
          amount: ['0.001'],
          tokenAddress: '0x3600000000000000000000000000000000000000',
          fee: { type: 'level', config: { feeLevel: 'LOW' } },
        },
      },
      {
        name: 'no tokenAddress (native)',
        params: {
          blockchain: from.blockchain,
          walletAddress: from.address,
          destinationAddress: to.address,
          amount: ['0.001'],
          fee: { type: 'level', config: { feeLevel: 'LOW' } },
        },
      },
    ];

    for (const attempt of attempts) {
      console.log(`\nTrying: ${attempt.name}`);
      try {
        const tx = await client.createTransaction(attempt.params);
        console.log('✅ SUCCESS:', JSON.stringify(tx.data, null, 2));
        break;
      } catch (e) {
        console.log('❌ Failed:', e.message?.substring(0, 150));
      }
    }
  }
}

test().catch((e) => console.error('Error:', e.message));
