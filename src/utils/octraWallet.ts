import crypto from 'crypto-browserify';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export interface OctraWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  private_key_b64: string;
  public_key_b64: string;
  mnemonic?: string[];
  networkType: string;
}

// Base58 encoding for octra addresses
function base58Encode(buffer: Buffer): string {
  if (buffer.length === 0) return "";

  let num: bigint = BigInt("0x" + buffer.toString("hex"));
  let encoded: string = "";

  while (num > 0n) {
    const remainder: bigint = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
  }

  // Handle leading zeros
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = "1" + encoded;
  }

  return encoded;
}

// Create octra address
function createOctraAddress(publicKey: Buffer): string {
  const hash: Buffer = crypto.createHash("sha256").update(publicKey).digest();
  const base58Hash: string = base58Encode(hash);
  return "oct" + base58Hash;
}

// Generate entropy using crypto.randomBytes
function generateEntropy(strength: number = 128): Buffer {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error("Strength must be 128, 160, 192, 224 or 256 bits");
  }
  return crypto.randomBytes(strength / 8);
}

// Generate new Octra wallet
export async function generateOctraWallet(): Promise<OctraWallet> {
  try {
    // Generate entropy and mnemonic
    const entropy = generateEntropy(128);
    const mnemonic = bip39.entropyToMnemonic(entropy.toString("hex"));
    const mnemonicWords = mnemonic.split(" ");
    
    // Generate seed from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Create Ed25519 keypair from first 32 bytes of seed
    const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    
    const privateKeyRaw = Buffer.from(keyPair.secretKey.slice(0, 32));
    const publicKeyRaw = Buffer.from(keyPair.publicKey);
    
    // Create address
    const address = createOctraAddress(publicKeyRaw);
    
    return {
      address,
      privateKey: privateKeyRaw.toString('hex'),
      publicKey: publicKeyRaw.toString('hex'),
      private_key_b64: privateKeyRaw.toString('base64'),
      public_key_b64: publicKeyRaw.toString('base64'),
      mnemonic: mnemonicWords,
      networkType: 'MainCoin'
    };
  } catch (error) {
    throw new Error(`Failed to generate wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Import wallet from private key
export async function importOctraWallet(privateKeyInput: string): Promise<OctraWallet> {
  try {
    let privateKeyBuffer: Buffer;
    
    // Try to parse as Base64 first (44 characters)
    if (privateKeyInput.length === 44) {
      try {
        privateKeyBuffer = Buffer.from(privateKeyInput, 'base64');
        if (privateKeyBuffer.length !== 32) {
          throw new Error('Invalid Base64 private key length');
        }
      } catch {
        throw new Error('Invalid Base64 private key format');
      }
    }
    // Try to parse as Hex (64 characters)
    else if (privateKeyInput.length === 64) {
      try {
        privateKeyBuffer = Buffer.from(privateKeyInput, 'hex');
        if (privateKeyBuffer.length !== 32) {
          throw new Error('Invalid Hex private key length');
        }
      } catch {
        throw new Error('Invalid Hex private key format');
      }
    }
    // Try to parse as Hex with 0x prefix (66 characters)
    else if (privateKeyInput.length === 66 && privateKeyInput.startsWith('0x')) {
      try {
        privateKeyBuffer = Buffer.from(privateKeyInput.slice(2), 'hex');
        if (privateKeyBuffer.length !== 32) {
          throw new Error('Invalid Hex private key length');
        }
      } catch {
        throw new Error('Invalid Hex private key format');
      }
    }
    else {
      throw new Error('Private key must be 44 characters (Base64) or 64 characters (Hex)');
    }
    
    // Create keypair from private key
    const keyPair = nacl.sign.keyPair.fromSeed(privateKeyBuffer);
    const publicKeyRaw = Buffer.from(keyPair.publicKey);
    
    // Create address
    const address = createOctraAddress(publicKeyRaw);
    
    return {
      address,
      privateKey: privateKeyBuffer.toString('hex'),
      publicKey: publicKeyRaw.toString('hex'),
      private_key_b64: privateKeyBuffer.toString('base64'),
      public_key_b64: publicKeyRaw.toString('base64'),
      networkType: 'MainCoin'
    };
  } catch (error) {
    throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mock API functions for demonstration
export async function sendDailyTransaction(privateKey: string, fromAddress: string): Promise<{
  success: boolean;
  message: string;
  txHash?: string;
}> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transaction hash
    const txHash = crypto.randomBytes(32).toString('hex');
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        message: 'Daily OM transaction sent successfully! 🕉️',
        txHash
      };
    } else {
      return {
        success: false,
        message: 'Transaction failed. Please try again later.'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function checkDailyTransactionStatus(address: string): Promise<{
  canSendToday: boolean;
  lastTransactionDate?: number;
  dailyCount: number;
}> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - in real implementation, this would check blockchain
    const today = new Date().toDateString();
    const lastSent = localStorage.getItem(`daily_tx_${address}`);
    
    const canSendToday = lastSent !== today;
    const dailyCount = parseInt(localStorage.getItem(`daily_count_${address}`) || '0');
    
    return {
      canSendToday,
      lastTransactionDate: lastSent ? new Date(lastSent).getTime() : undefined,
      dailyCount
    };
  } catch (error) {
    return {
      canSendToday: true,
      dailyCount: 0
    };
  }
}

export async function getBalanceAndNonce(address: string): Promise<{
  balance: number;
  nonce: number;
}> {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock balance - in real implementation, this would query blockchain
    const mockBalance = Math.random() * 1000;
    const mockNonce = Math.floor(Math.random() * 100);
    
    return {
      balance: mockBalance,
      nonce: mockNonce
    };
  } catch (error) {
    return {
      balance: 0,
      nonce: 0
    };
  }
}