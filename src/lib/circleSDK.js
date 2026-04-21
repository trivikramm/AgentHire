import {
  initiateDeveloperControlledWalletsClient,
} from '@circle-fin/developer-controlled-wallets';

const ARC_TESTNET_USDC = '0x3600000000000000000000000000000000000';
const EXPLORER_URL = process.env.ARC_EXPLORER_URL || 'https://testnet.arcscan.app';

let client = null;

function getClient() {
  if (client) return client;

  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  // Only skip if truly not configured
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
  const sdk = getClient();

  if (!sdk) {
    return simulateTransfer(fromWalletAddress, toWalletAddress, amount, memo);
  }

  try {
    const response = await sdk.createTransaction({
      blockchain: 'ARC-TESTNET',
      walletAddress: fromWalletAddress,
      destinationAddress: toWalletAddress,
      amount: [amount.toFixed(6)],
      tokenAddress: ARC_TESTNET_USDC,
      fee: { type: 'level', config: { feeLevel: 'LOW' } },
    });

    const txId = response.data?.id;
    if (!txId) throw new Error('No transaction ID returned');

    let txHash = null;
    let state = response.data?.state;
    const terminalStates = new Set(['COMPLETE', 'FAILED', 'CANCELLED', 'DENIED']);

    let attempts = 0;
    while (!terminalStates.has(state) && attempts < 10) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const poll = await sdk.getTransaction({ id: txId });
        state = poll.data?.transaction?.state;
        txHash = poll.data?.transaction?.txHash;
      } catch {
        break;
      }
      attempts++;
    }

    if (state === 'COMPLETE' && txHash) {
      console.log(`✅ Real transfer: $${amount} USDC | tx: ${txHash}`);
      return {
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
    }

    throw new Error(`Transaction ended in state: ${state}`);
  } catch (error) {
    console.error(`Real transfer failed: ${error.message} — falling back to simulation`);
    return simulateTransfer(fromWalletAddress, toWalletAddress, amount, memo);
  }
}

export async function getWalletBalance(walletId) {
  const sdk = getClient();

  if (!sdk) {
    return { usdc: '1.000000' };
  }

  try {
    const response = await sdk.getWalletTokenBalance({ id: walletId });
    const balances = response.data?.tokenBalances || [];
    const usdc = balances.find((b) => b.token?.symbol === 'USDC');
    return { usdc: usdc?.amount || '0' };
  } catch (error) {
    console.error('Balance check failed:', error.message);
    return { usdc: '0' };
  }
}

async function simulateTransfer(from, to, amount, memo) {
  const crypto = await import('crypto');
  const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;

  return {
    id: `sim_tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
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
}

export default {
  createAgentWallet,
  sendUSDCTransfer,
  getWalletBalance,
};