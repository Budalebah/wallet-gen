import crypto from 'crypto-browserify';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// Base58 encoding for octra addresses
function base58Encode(buffer) {
  if (buffer.length === 0) return "";

  let num = BigInt("0x" + buffer.toString("hex"));
  let encoded = "";

  while (num > 0n) {
    const remainder = num % 58n;
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
function createOctraAddress(publicKey) {
  const hash = crypto.createHash("sha256").update(publicKey).digest();
  const base58Hash = base58Encode(hash);
  return "oct" + base58Hash;
}

// Generate entropy using crypto.randomBytes
function generateEntropy(strength = 128) {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error("Strength must be 128, 160, 192, 224 or 256 bits");
  }
  return crypto.randomBytes(strength / 8);
}

// Generate new Octra wallet
export async function generateOctraWallet() {
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
    throw new Error(`Failed to generate wallet: ${error.message}`);
  }
}

// Import wallet from private key
export async function importOctraWallet(privateKeyInput) {
  try {
    let privateKeyBuffer;
    
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
    throw new Error(`Failed to import wallet: ${error.message}`);
  }
}

// Mock daily transaction function
export async function sendDailyTransaction(privateKey, fromAddress) {
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
      message: `Transaction failed: ${error.message}`
    };
  }
}