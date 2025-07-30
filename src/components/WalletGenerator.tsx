import React, { useState } from 'react';
import { generateWallet, deriveForNetwork, WalletData } from '../utils/walletGenerator';
import { Buffer } from 'buffer';

const WalletGenerator: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('Ready to generate wallet...');
  const [networkType, setNetworkType] = useState(0);
  const [derivationIndex, setDerivationIndex] = useState(0);
  const [derivedAddress, setDerivedAddress] = useState<string>('');
  const [derivedPath, setDerivedPath] = useState<string>('');

  const handleGenerateWallet = async () => {
    setIsGenerating(true);
    setStatus('Starting wallet generation...');
    setWallet(null);

    try {
      const newWallet = await generateWallet((progress) => {
        setStatus(progress);
      });
      setWallet(newWallet);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDerivePath = () => {
    if (!wallet) {
      alert('Please generate a wallet first');
      return;
    }

    try {
      const seed = Buffer.from(wallet.seed_hex, 'hex');
      const derived = deriveForNetwork(seed, networkType, 0, 0, 0, derivationIndex);
      
      const pathString = derived.path
        .map(i => (i & 0x7fffffff).toString() + (i & 0x80000000 ? "'" : ""))
        .join("/");
      
      setDerivedAddress(derived.address);
      setDerivedPath(pathString);
    } catch (error) {
      alert(`Derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSaveWallet = () => {
    if (!wallet) return;

    const timestamp = Math.floor(Date.now() / 1000);
    const filename = `octra_wallet_${wallet.address.slice(-8)}_${timestamp}.txt`;

    const content = `octra wallet
${"=".repeat(50)}

SECURITY WARNING: KEEP THIS FILE SECURE AND NEVER SHARE YOUR PRIVATE KEY

Generated: ${new Date().toISOString().replace("T", " ").slice(0, 19)}
Address Format: oct + Base58(SHA256(pubkey))

Mnemonic: ${wallet.mnemonic.join(" ")}
Private Key (B64): ${wallet.private_key_b64}
Public Key (B64): ${wallet.public_key_b64}
Address: ${wallet.address}

Technical Details:
Entropy: ${wallet.entropy_hex}
Signature Algorithm: Ed25519
Derivation: BIP39-compatible (PBKDF2-HMAC-SHA512, 2048 iterations)
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wallet-generator">
      <h1>Octra Wallet Generator</h1>
      
      <div className="status-section">
        <div className="status">{status}</div>
        <button 
          className="generate-btn"
          onClick={handleGenerateWallet}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Wallet'}
        </button>
      </div>

      {wallet && (
        <div className="wallet-info">
          <h2>Your Wallet</h2>
          
          <div className="warning">
            ⚠️ Do not store this file online or on cloud services, keep your private key secure and never share it!
          </div>

          <div className="wallet-fields">
            <div className="field">
              <label>Mnemonic (12 words)</label>
              <div className="field-value mnemonic">{wallet.mnemonic.join(' ')}</div>
            </div>

            <div className="field">
              <label>Private Key</label>
              <div className="field-value">
                <div>Raw: {wallet.private_key_hex}</div>
                <div>B64: {wallet.private_key_b64}</div>
              </div>
            </div>

            <div className="field">
              <label>Public Key</label>
              <div className="field-value">
                <div>Raw: {wallet.public_key_hex}</div>
                <div>B64: {wallet.public_key_b64}</div>
              </div>
            </div>

            <div className="field">
              <label>Octra Address</label>
              <div className="field-value address">{wallet.address}</div>
            </div>

            <div className="field">
              <label>Technical Information</label>
              <div className="field-value">
                <div>Entropy: {wallet.entropy_hex}</div>
                <div>Seed: {wallet.seed_hex.substring(0, 64)}...</div>
                <div>Master Chain: {wallet.master_chain_hex}</div>
              </div>
            </div>

            <div className="field">
              <label>Signature Test</label>
              <div className="field-value">
                <div>Message: {wallet.test_message}</div>
                <div>Signature: {wallet.test_signature}</div>
                <div>Validation: <span className={wallet.signature_valid ? 'valid' : 'invalid'}>
                  {wallet.signature_valid ? 'VALID' : 'INVALID'}
                </span></div>
              </div>
            </div>

            <div className="field">
              <label>HD Derivation</label>
              <div className="field-value derivation">
                <div className="derivation-controls">
                  <select 
                    value={networkType} 
                    onChange={(e) => setNetworkType(parseInt(e.target.value))}
                  >
                    <option value={0}>MainCoin</option>
                    <option value={1}>SubCoin</option>
                    <option value={2}>Contract</option>
                    <option value={3}>Subnet</option>
                    <option value={4}>Account</option>
                  </select>
                  
                  <input 
                    type="number" 
                    value={derivationIndex}
                    onChange={(e) => setDerivationIndex(parseInt(e.target.value))}
                    min="0" 
                    max="100"
                  />
                  
                  <button onClick={handleDerivePath}>Derive</button>
                </div>
                
                {derivedAddress && (
                  <div className="derived-info">
                    <div>Derived Address: {derivedAddress}</div>
                    <div>Path: {derivedPath}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="save-btn" onClick={handleSaveWallet}>
            Save Wallet File
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletGenerator;