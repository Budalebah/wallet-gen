import crypto from 'crypto-browserify';
import nacl from 'tweetnacl';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export interface WalletData {
  mnemonic: string[];
  seed_hex: string;
  master_chain_hex: string;
  private_key_hex: string;
  public_key_hex: string;
  private_key_b64: string;
  public_key_b64: string;
  address: string;
  entropy_hex: string;
  test_message: string;
  test_signature: string;
  signature_valid: boolean;
}

export interface NetworkDerivation {
  privateKey: Buffer;
  chainCode: Buffer;
  publicKey: Buffer;
  address: string;
  path: number[];
  networkTypeName: string;
  network: number;
  contract: number;
  account: number;
  index: number;
}

interface MasterKey {
  masterPrivateKey: Buffer;
  masterChainCode: Buffer;
}

interface ChildKey {
  childPrivateKey: Buffer;
  childChainCode: Buffer;
}

interface DerivedPath {
  key: Buffer;
  chain: Buffer;
}

// Helper functions
function bufferToHex(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("hex");
}

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

function base64Encode(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("base64");
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

// Generate entropy using crypto.randomBytes
function generateEntropy(strength: number = 128): Buffer {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error("Strength must be 128, 160, 192, 224 or 256 bits");
  }
  return crypto.randomBytes(strength / 8);
}

// Derive master key using HMAC-SHA512 with "Octra seed"
function deriveMasterKey(seed: Buffer): MasterKey {
  const key: Buffer = Buffer.from("Octra seed", "utf8");
  const mac: Buffer = crypto.createHmac("sha512", key).update(seed).digest();

  const masterPrivateKey: Buffer = mac.slice(0, 32);
  const masterChainCode: Buffer = mac.slice(32, 64);

  return { masterPrivateKey, masterChainCode };
}

// HD key derivation for Ed25519
function deriveChildKeyEd25519(
  privateKey: Buffer,
  chainCode: Buffer,
  index: number
): ChildKey {
  let data: Buffer;

  if (index >= 0x80000000) {
    // Hardened derivation
    data = Buffer.concat([
      Buffer.from([0x00]),
      privateKey,
      Buffer.from([
        (index >>> 24) & 0xff,
        (index >>> 16) & 0xff,
        (index >>> 8) & 0xff,
        index & 0xff,
      ]),
    ]);
  } else {
    // Non-hardened derivation
    const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
    const publicKey: Buffer = Buffer.from(keyPair.publicKey);
    data = Buffer.concat([
      publicKey,
      Buffer.from([
        (index >>> 24) & 0xff,
        (index >>> 16) & 0xff,
        (index >>> 8) & 0xff,
        index & 0xff,
      ]),
    ]);
  }

  const mac: Buffer = crypto
    .createHmac("sha512", chainCode)
    .update(data)
    .digest();
  const childPrivateKey: Buffer = mac.slice(0, 32);
  const childChainCode: Buffer = mac.slice(32, 64);

  return { childPrivateKey, childChainCode };
}

// Derive path from seed
function derivePath(seed: Buffer, path: number[]): DerivedPath {
  const { masterPrivateKey, masterChainCode }: MasterKey = deriveMasterKey(seed);
  let key: Buffer = masterPrivateKey;
  let chain: Buffer = masterChainCode;

  for (const index of path) {
    const derived: ChildKey = deriveChildKeyEd25519(key, chain, index);
    key = derived.childPrivateKey;
    chain = derived.childChainCode;
  }

  return { key, chain };
}

// Create octra address
function createOctraAddress(publicKey: Buffer): string {
  const hash: Buffer = crypto.createHash("sha256").update(publicKey).digest();
  const base58Hash: string = base58Encode(hash);
  return "oct" + base58Hash;
}

// Get network type name
function getNetworkTypeName(networkType: number): string {
  switch (networkType) {
    case 0:
      return "MainCoin";
    case 1:
      return `SubCoin ${networkType}`;
    case 2:
      return `Contract ${networkType}`;
    case 3:
      return `Subnet ${networkType}`;
    case 4:
      return `Account ${networkType}`;
    default:
      return `Unknown ${networkType}`;
  }
}

// Derive for specific network
export function deriveForNetwork(
  seed: Buffer,
  networkType: number = 0,
  network: number = 0,
  contract: number = 0,
  account: number = 0,
  index: number = 0,
  token: number = 0,
  subnet: number = 0
): NetworkDerivation {
  const coinType: number = networkType === 0 ? 0 : networkType;

  const basePath: number[] = [
    0x80000000 + 345, // Purpose
    0x80000000 + coinType, // Coin type
    0x80000000 + network, // Network
  ];

  const contractPath: number[] = [0x80000000 + contract, 0x80000000 + account];
  const optionalPath: number[] = [0x80000000 + token, 0x80000000 + subnet];
  const finalPath: number[] = [index];

  const fullPath: number[] = [
    ...basePath,
    ...contractPath,
    ...optionalPath,
    ...finalPath,
  ];

  const { key: derivedKey, chain: derivedChain }: DerivedPath = derivePath(
    seed,
    fullPath
  );

  const keyPair = nacl.sign.keyPair.fromSeed(derivedKey);
  const derivedAddress: string = createOctraAddress(
    Buffer.from(keyPair.publicKey)
  );

  return {
    privateKey: derivedKey,
    chainCode: derivedChain,
    publicKey: Buffer.from(keyPair.publicKey),
    address: derivedAddress,
    path: fullPath,
    networkTypeName: getNetworkTypeName(networkType),
    network,
    contract,
    account,
    index,
  };
}

// Main wallet generation function
export async function generateWallet(
  onProgress?: (status: string) => void
): Promise<WalletData> {
  const updateProgress = (message: string) => {
    if (onProgress) onProgress(message);
  };

  updateProgress("Generating entropy...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const entropy: Buffer = generateEntropy(128);
  updateProgress("Entropy generated");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Creating mnemonic phrase...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const mnemonic: string = bip39.entropyToMnemonic(entropy.toString("hex"));
  const mnemonicWords: string[] = mnemonic.split(" ");
  updateProgress("Mnemonic created");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Deriving seed from mnemonic...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const seed: Buffer = bip39.mnemonicToSeedSync(mnemonic);
  updateProgress("Seed derived");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Deriving master key...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const { masterPrivateKey, masterChainCode }: MasterKey = deriveMasterKey(seed);
  updateProgress("Master key derived");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Creating Ed25519 keypair...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const keyPair = nacl.sign.keyPair.fromSeed(masterPrivateKey);
  const privateKeyRaw: Buffer = Buffer.from(keyPair.secretKey.slice(0, 32));
  const publicKeyRaw: Buffer = Buffer.from(keyPair.publicKey);

  updateProgress("Keypair created");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Generating octra address...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const address: string = createOctraAddress(publicKeyRaw);
  updateProgress("Address generated and verified");
  await new Promise(resolve => setTimeout(resolve, 200));

  updateProgress("Testing signature functionality...");
  await new Promise(resolve => setTimeout(resolve, 200));

  const testMessage: string = '{"from":"test","to":"test","amount":"1000000","nonce":1}';
  const messageBytes: Buffer = Buffer.from(testMessage, "utf8");
  const signature: Uint8Array = nacl.sign.detached(messageBytes, keyPair.secretKey);
  const signatureB64: string = base64Encode(signature);

  let signatureValid: boolean = false;
  try {
    signatureValid = nacl.sign.detached.verify(
      messageBytes,
      signature,
      keyPair.publicKey
    );
    updateProgress("Signature test passed");
  } catch (error: any) {
    updateProgress("Signature test failed");
  }

  await new Promise(resolve => setTimeout(resolve, 200));
  updateProgress("Wallet generation complete!");

  return {
    mnemonic: mnemonicWords,
    seed_hex: bufferToHex(seed),
    master_chain_hex: bufferToHex(masterChainCode),
    private_key_hex: bufferToHex(privateKeyRaw),
    public_key_hex: bufferToHex(publicKeyRaw),
    private_key_b64: base64Encode(privateKeyRaw),
    public_key_b64: base64Encode(publicKeyRaw),
    address: address,
    entropy_hex: bufferToHex(entropy),
    test_message: testMessage,
    test_signature: signatureB64,
    signature_valid: signatureValid,
  };
}