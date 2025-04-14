import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is required');
}

// Initialize a SUI JSON-RPC provider (using testnet; switch to mainnet as needed)
const provider = new SuiClient({ url: getFullnodeUrl('testnet') });

/**
 * Get wallet balance and address using the private key
 */
export async function getWalletBalance() {
  try {
    // Create the keypair using your private key (assumed to be in hex format)
    const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);
    const suiAddress = keypair.getPublicKey().toSuiAddress();

    // Retrieve coins from the SUI blockchain
    const balanceResponse = await provider.getCoins({ owner: suiAddress });
    return {
      address: suiAddress,
      balances: balanceResponse.data
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
}