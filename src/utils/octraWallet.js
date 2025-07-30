// Simple mock wallet functions without crypto dependencies

export async function generateOctraWallet() {
  try {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock data that looks realistic
    const randomHex = () => Math.random().toString(16).substr(2, 8);
    const mockPrivateKey = Array(8).fill().map(() => randomHex()).join('');
    const mockAddress = 'oct' + Array(6).fill().map(() => randomHex()).join('');
    
    // Mock mnemonic words
    const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'];
    
    return {
      address: mockAddress,
      privateKey: mockPrivateKey,
      publicKey: mockPrivateKey.replace(/./g, () => Math.random().toString(16)[0]),
      private_key_b64: btoa(mockPrivateKey.slice(0, 32)),
      public_key_b64: btoa(mockPrivateKey.slice(0, 32)),
      mnemonic: words,
      networkType: 'MainCoin'
    };
  } catch (error) {
    throw new Error(`Failed to generate wallet: ${error.message}`);
  }
}

export async function importOctraWallet(privateKeyInput) {
  try {
    if (!privateKeyInput || privateKeyInput.length < 32) {
      throw new Error('Private key must be at least 32 characters');
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockAddress = 'oct' + privateKeyInput.slice(0, 32).split('').map(c => 
      Math.random().toString(16)[0]
    ).join('').slice(0, 40);
    
    return {
      address: mockAddress,
      privateKey: privateKeyInput.slice(0, 64),
      publicKey: privateKeyInput.slice(0, 64).replace(/./g, () => Math.random().toString(16)[0]),
      private_key_b64: btoa(privateKeyInput.slice(0, 32)),
      public_key_b64: btoa(privateKeyInput.slice(0, 32)),
      networkType: 'MainCoin'
    };
  } catch (error) {
    throw new Error(`Failed to import wallet: ${error.message}`);
  }
}

export async function sendDailyTransaction(privateKey, fromAddress) {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock transaction hash
    const txHash = 'tx_' + Math.random().toString(36).substr(2, 32);
    
    // 85% success rate
    const success = Math.random() > 0.15;
    
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

export async function checkDailyTransactionStatus(address) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const today = new Date().toDateString();
    const lastSent = localStorage.getItem(`daily_tx_${address}`);
    
    return {
      canSendToday: lastSent !== today,
      lastTransactionDate: lastSent ? new Date(lastSent).getTime() : undefined,
      dailyCount: parseInt(localStorage.getItem(`daily_count_${address}`) || '0')
    };
  } catch (error) {
    return {
      canSendToday: true,
      dailyCount: 0
    };
  }
}

export async function getBalanceAndNonce(address) {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock balance between 0-1000
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