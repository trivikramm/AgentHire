// src/lib/circleSDK.js
import { v4 as uuidv4 } from 'uuid';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const ARC_TESTNET_USDC = '0x3600000000000000000000000000000000000000';
const EXPLORER_URL = process.env.ARC_EXPLORER_URL || 'https://testnet.arcscan.app';

let client = null;

function getClient() {
  if (client) return client;

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey || !entitySecret || apiKey === 'your_circle_api_key' || entitySecret === 'your_entity_secret') {
    console.warn('⚠️ Circle SDK not configured — using simulation mode');
    return null;
  }

  try {
    client = initiateDeveloperControlledWalletsClient({
      apiKey,
      entitySecret,
    });
    console.log('✅ Circle SDK initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Circle SDK init error:', error.message);
    return null;
  }
}

function createEvent(type, message, data = {}) {
  return {
    id: uuidv4(),
    timestamp: Date.now(),
    type,
    message,
    data,
  };
}

export async function fundWallet(walletId, amount = 1) {
  const sdk = getClient();
  const apiKey = process.env.CIRCLE_API_KEY;

  if (!sdk) {
    console.log('⚠️ Cannot fund: SDK not configured');
    return { success: false };
  }

  if (!apiKey) {
    console.error('❌ CIRCLE_API_KEY not set');
    return { success: false };
  }

  try {
    const response = await fetch('https://testnet-api.circle.com/v1/faucet', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletId,
        amount: amount.toFixed(6),
        token: 'USDC',
        blockchain: 'ARC-TESTNET',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Funded wallet ${walletId} with $${amount} USDC`);
      return { success: true, ...data };
    } else {
      const err = await response.text();
      console.error('❌ Faucet error:', err);
      return { success: false, error: err };
    }
  } catch (error) {
    console.error('❌ Funding failed:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createAgentWallet(walletSetId, agentName) {
  const sdk = getClient();

  if (!sdk) {
    const crypto = await import('crypto');
    return {
      id: `sim_wallet_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      address: `0x${crypto.randomBytes(20).toString('hex')}`,
      blockchain: 'ARC-TESTNET',
      simulated: true,
    };
  }

  try {
    const response = await sdk.createWallets({
      walletSetId,
      blockchains: ['ARC-TESTNET'],
      count: 1,
      accountType: 'EOA',
    });

    const wallet = response.data?.wallets?.[0];
    if (!wallet) throw new Error('No wallet returned');

    console.log(`✅ Created real wallet for ${agentName}: ${wallet.address}`);
    return {
      id: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      simulated: false,
    };
  } catch (error) {
    console.error(`Failed to create wallet for ${agentName}:`, error.message);
    const crypto = await import('crypto');
    return {
      id: `sim_wallet_${Date.now()}`,
      address: `0x${crypto.randomBytes(20).toString('hex')}`,
      blockchain: 'ARC-TESTNET',
      simulated: true,
    };
  }
}

export async function sendUSDCTransfer(fromWalletAddress, toWalletAddress, amount, memo = '') {
  const events = [];
  const sdk = getClient();

  if (!sdk) {
    const simResult = await simulateTransfer(fromWalletAddress, toWalletAddress, amount, memo);
    return { payment: simResult.payment, events: simResult.events };
  }

  try {
    const walletSetId = process.env.CIRCLE_WALLET_SET_ID;
    const walletList = await sdk.listWallets({ walletSetId });
    const wallet = walletList.data?.wallets?.find(
      (w) => w.address.toLowerCase() === fromWalletAddress.toLowerCase()
    );

    if (wallet) {
      const bal = await sdk.getWalletTokenBalance({ id: wallet.id });
      const usdcBalance = bal.data?.tokenBalances?.find((b) => b.token?.symbol === 'USDC');
      const currentBalance = parseFloat(usdcBalance?.amount || '0');

      if (currentBalance < amount) {
        const fundingMsg = `💰 Balance low ($${currentBalance}), funding ${wallet.id.slice(0, 8)}...`;
        console.log(fundingMsg);
        events.push(createEvent('funding', fundingMsg, {
          walletId: wallet.id,
          currentBalance,
          needed: amount,
        }));

        const funded = await fundWallet(wallet.id, amount + 1);

        if (!funded.success) {
          const failMsg = '❌ Funding failed — falling back to simulation';
          console.error(failMsg);
          events.push(createEvent('error', failMsg, { reason: funded.error }));

          const sim = await simulateTransfer(fromWalletAddress, toWalletAddress, amount, memo);
          return {
            payment: sim.payment,
            events: [...events, ...sim.events],
          };
        }

        const fundedMsg = `✅ Funded wallet with $${(amount + 1).toFixed(4)} USDC`;
        console.log(fundedMsg);
        events.push(createEvent('funding', fundedMsg, {
          walletId: wallet.id,
          amount: amount + 1,
        }));

        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    const response = await sdk.createTransaction({
      blockchain: 'ARC-TESTNET',
      walletAddress: fromWalletAddress,
      destinationAddress: toWalletAddress,
      amount: [amount.toFixed(6)],
      tokenAddress: ARC_TESTNET_USDC,
      fee: { type: 'level', config: { feeLevel: 'LOW' } },
    });

    const txId = response?.data?.id;
    const txState = response?.data?.state;

    if (!txId) {
      throw new Error('No transaction ID returned');
    }

    const submittedMsg = `⏳ Transfer submitted: $${amount.toFixed(3)} USDC | id: ${txId} | state: ${txState}`;
    console.log(submittedMsg);
    events.push(createEvent('transfer_submitted', submittedMsg, {
      transferId: txId,
      amount,
      from: fromWalletAddress,
      to: toWalletAddress,
      state: txState,
    }));

    await new Promise((r) => setTimeout(r, 1500));

    let txHash = null;
    let state = txState;

    try {
      const poll = await sdk.getTransaction({ id: txId });
      state = poll.data?.transaction?.state;
      txHash = poll.data?.transaction?.txHash;
    } catch (pollError) {
      console.warn('⚠️ Poll failed, using initial state');
    }

    if (state === 'COMPLETE' && txHash) {
      const confirmedMsg = `✅ Real transfer: $${amount.toFixed(3)} USDC | tx: ${txHash}`;
      console.log(confirmedMsg);
      events.push(createEvent('transfer_confirmed', confirmedMsg, {
        transferId: txId,
        txHash,
        amount,
        state: 'CONFIRMED',
      }));

      const payment = {
        id: txId,
        txHash,
        from: fromWalletAddress,
        to: toWalletAddress,
        amount,
        currency: 'USDC',
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        blockExplorerUrl: `${EXPLORER_URL}/tx/${txHash}`,
        memo,
        network: 'ARC-TESTNET',
        simulated: false,
      };

      return { payment, events };
    }

    const pendingMsg = `⏳ Transfer processing: $${amount.toFixed(3)} USDC | id: ${txId} | state: ${state}`;
    console.log(pendingMsg);
    events.push(createEvent('transfer_pending', pendingMsg, {
      transferId: txId,
      txHash: txHash || null,
      amount,
      state: state || 'UNKNOWN',
    }));

    const payment = {
      id: txId,
      txHash: txHash || `pending_${txId}`,
      from: fromWalletAddress,
      to: toWalletAddress,
      amount,
      currency: 'USDC',
      status: (state === 'INITIATED' || state === 'PENDING') ? 'pending' : 'confirmed',
      timestamp: new Date().toISOString(),
      blockExplorerUrl: txHash
        ? `${EXPLORER_URL}/tx/${txHash}`
        : `${EXPLORER_URL}/address/${fromWalletAddress}`,
      memo,
      network: 'ARC-TESTNET',
      simulated: false,
    };

    return { payment, events };

  } catch (error) {
    const errorMsg = `❌ Transfer error: ${error.message?.substring(0, 60)} — simulating`;
    console.error(errorMsg);
    events.push(createEvent('error', errorMsg, { error: error.message }));

    const sim = await simulateTransfer(fromWalletAddress, toWalletAddress, amount, memo);
    return {
      payment: sim.payment,
      events: [...events, ...sim.events],
    };
  }
}

async function simulateTransfer(from, to, amount, memo) {
  const crypto = await import('crypto');
  const events = [];
  const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
  const transferId = `sim_${Date.now()}`;

  const submittedMsg = `⏳ Simulated transfer: $${amount.toFixed(3)} USDC | id: ${transferId}`;
  console.log(submittedMsg);
  events.push(createEvent('transfer_submitted', submittedMsg, {
    transferId,
    amount,
    from,
    to,
    state: 'SIMULATED',
  }));

  await new Promise((r) => setTimeout(r, 300));

  const confirmedMsg = `✅ Simulated transfer: $${amount.toFixed(3)} USDC | tx: ${txHash}`;
  console.log(confirmedMsg);
  events.push(createEvent('transfer_confirmed', confirmedMsg, {
    transferId,
    txHash,
    amount,
    state: 'CONFIRMED',
  }));

  const payment = {
    id: transferId,
    txHash,
    from,
    to,
    amount,
    currency: 'USDC',
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    blockExplorerUrl: `${EXPLORER_URL}/tx/${txHash}`,
    memo,
    network: 'ARC-TESTNET',
    simulated: true,
  };

  return { payment, events };
}

export default {
  createAgentWallet,
  sendUSDCTransfer,
  fundWallet,
};