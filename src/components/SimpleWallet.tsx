import { useState, useEffect } from 'react'
import {
  generateOctraWallet,
  importOctraWallet,
  sendDailyTransaction,
  checkDailyTransactionStatus,
  getBalanceAndNonce
} from '../utils/octraWallet'

interface OctraWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  private_key_b64: string;
  public_key_b64: string;
  mnemonic?: string[];
  networkType: string;
}

const SimpleWallet = () => {
  const [activeWallet, setActiveWallet] = useState<OctraWallet | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [currentWalletData, setCurrentWalletData] = useState<OctraWallet | null>(null)
  const [balance, setBalance] = useState('0')
  
  // Import wallet state
  const [showImportWallet, setShowImportWallet] = useState(false)
  const [importPrivateKey, setImportPrivateKey] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  
  // Daily Transaction State
  const [dailyTransactionStatus, setDailyTransactionStatus] = useState<{
    canSendToday: boolean
    lastTransactionDate?: number
    dailyCount: number
  }>({ canSendToday: true, dailyCount: 0 })
  const [isDailySending, setIsDailySending] = useState(false)
  const [dailyTransactionResult, setDailyTransactionResult] = useState<{
    success: boolean
    message: string
    txHash?: string
  } | null>(null)

  // Check daily transaction status and balance when wallet changes
  useEffect(() => {
    if (activeWallet?.address) {
      checkDailyStatus()
      fetchBalance()
    }
  }, [activeWallet?.address])

  const checkDailyStatus = async () => {
    if (!activeWallet?.address) return
    
    try {
      const status = await checkDailyTransactionStatus(activeWallet.address)
      setDailyTransactionStatus(status)
    } catch (error) {
      console.error('Error checking daily transaction status:', error)
    }
  }

  const fetchBalance = async () => {
    if (!activeWallet?.address) return
    
    try {
      const { balance } = await getBalanceAndNonce(activeWallet.address)
      setBalance(balance.toFixed(6))
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance('0')
    }
  }

  const handleCreateWallet = async () => {
    setIsLoading(true)
    setError('')

    try {
      const newWallet = await generateOctraWallet()
      
      setActiveWallet(newWallet)
      setCurrentWalletData(newWallet)
      setShowPrivateKey(true)
      
    } catch (error: any) {
      setError(error.message || 'Failed to create wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportWallet = async () => {
    if (!importPrivateKey.trim()) {
      setError('Please enter a private key')
      return
    }

    setIsImporting(true)
    setError('')

    try {
      const importedWallet = await importOctraWallet(importPrivateKey.trim())
      
      setActiveWallet(importedWallet)
      setCurrentWalletData(importedWallet)
      setShowPrivateKey(true)
      
      setShowImportWallet(false)
      setImportPrivateKey('')
      
    } catch (error: any) {
      setError(error.message || 'Failed to import wallet')
    } finally {
      setIsImporting(false)
    }
  }

  const handleSendDailyTransaction = async () => {
    if (!activeWallet || !currentWalletData?.privateKey) {
      setError('Wallet not available')
      return
    }

    // Bakiye kontrolü
    const currentBalance = parseFloat(balance)
    if (currentBalance <= 0) {
      setError('Insufficient balance! You need OCT tokens to send daily OM transaction.')
      return
    }

    setIsDailySending(true)
    setDailyTransactionResult(null)
    
    try {
      const result = await sendDailyTransaction(
        currentWalletData.privateKey,
        activeWallet.address
      )
      
      setDailyTransactionResult(result)
      
      // Update localStorage for mock daily transaction tracking
      if (result.success) {
        const today = new Date().toDateString()
        localStorage.setItem(`daily_tx_${activeWallet.address}`, today)
        const currentCount = parseInt(localStorage.getItem(`daily_count_${activeWallet.address}`) || '0')
        localStorage.setItem(`daily_count_${activeWallet.address}`, (currentCount + 1).toString())
      }
      
      // Refresh daily status and balance
      await checkDailyStatus()
      await fetchBalance()
      
    } catch (error: any) {
      console.error('Daily transaction error:', error)
      
      // Handle 502 and network errors gracefully
      let errorMessage = 'Failed to send daily transaction'
      if (error.message?.includes('502') || error.message?.includes('Bad Gateway')) {
        errorMessage = 'Octra network is temporarily unavailable. Please try again in a few minutes.'
      } else if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMessage = 'Network timeout. Please check your connection and try again.'
      } else if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
        errorMessage = 'Insufficient balance! You need OCT tokens to send daily OM transaction.'
      } else {
        errorMessage = `Failed to send daily transaction: ${error.message || error}`
      }
      
      setDailyTransactionResult({
        success: false,
        message: errorMessage
      })
    } finally {
      setIsDailySending(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">🕉️ Octra OM Wallet</h1>
        <p className="hero-subtitle">
          Connect with the Octra network spiritually through daily OM transactions. 
          Generate secure wallets and participate in the ecosystem's harmony.
        </p>
        <div className="hero-features">
          <div className="feature-badge">
            <span>🕉️</span>
            <span>Daily OM Transactions</span>
          </div>
          <div className="feature-badge">
            <span>🔐</span>
            <span>Secure Wallet Generation</span>
          </div>
          <div className="feature-badge">
            <span>⚡</span>
            <span>Real-time Balance</span>
          </div>
          <div className="feature-badge">
            <span>🌟</span>
            <span>Karma Points System</span>
          </div>
        </div>
      </section>

      {/* Wallet Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Wallet Management</h2>
          <p className="card-description">
            Create a new wallet or import an existing one to start your spiritual journey.
          </p>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleCreateWallet}
              disabled={isLoading}
              className="btn btn-primary btn-large"
            >
              {isLoading ? (
                <>
                  <span>🔄</span>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Create New Wallet</span>
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowImportWallet(true)}
              className="btn btn-secondary btn-large"
            >
              <span>📥</span>
              <span>Import Wallet</span>
            </button>

            {activeWallet && (
              <button
                onClick={fetchBalance}
                className="btn btn-secondary"
              >
                <span>🔄</span>
                <span>Refresh Balance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          background: 'var(--error-red)', 
          color: 'white', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--error-red)'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Wallet Info */}
      {activeWallet && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Wallet</h3>
            <p className="card-description">Your current wallet information and balance.</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1">
              <div className="field-group">
                <label className="field-label">📍 Wallet Address</label>
                <div className="field-value address">{activeWallet.address}</div>
              </div>
              
              <div className="field-group">
                <label className="field-label">💰 Balance</label>
                <div className={`field-value ${parseFloat(balance) > 0 ? 'highlight' : 'status-invalid'}`}>
                  {balance} OCT
                </div>
                {parseFloat(balance) <= 0 && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--error-red)', marginTop: '0.5rem' }}>
                    ⚠️ No balance - you need OCT tokens to send transactions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily OM Section */}
      {activeWallet && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🕉️ Daily OM Transaction</h3>
            <p className="card-description">
              Send your daily OM to connect with the network's spiritual energy.
            </p>
          </div>
          <div className="card-content">
            {/* Daily Status */}
            <div style={{ 
              background: 'var(--light-gray)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1.5rem',
              border: '1px solid var(--border-gray)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600' }}>Today's Status:</span>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: dailyTransactionStatus.canSendToday ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white'
                }}>
                  {dailyTransactionStatus.canSendToday ? '✅ Available' : '⏰ Already Sent Today'}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div><strong>Daily Count:</strong> {dailyTransactionStatus.dailyCount}</div>
                {dailyTransactionStatus.lastTransactionDate && (
                  <div><strong>Last Transaction:</strong> {new Date(dailyTransactionStatus.lastTransactionDate).toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Say OM Button */}
            <button
              onClick={handleSendDailyTransaction}
              disabled={isDailySending || !dailyTransactionStatus.canSendToday || parseFloat(balance) <= 0}
              className="btn btn-full btn-large"
              style={{
                background: dailyTransactionStatus.canSendToday && !isDailySending && parseFloat(balance) > 0
                  ? 'linear-gradient(135deg, var(--warning-orange), var(--error-red))'
                  : 'var(--secondary-gray)',
                marginBottom: '1.5rem',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}
            >
              {isDailySending ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ 
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    marginRight: '0.5rem'
                  }}></div>
                  Sending Daily OM...
                </div>
              ) : parseFloat(balance) <= 0 ? (
                '💰 Need OCT Balance to Send OM'
              ) : dailyTransactionStatus.canSendToday ? (
                '🕉️ Say OM - Send Daily Transaction'
              ) : (
                '✓ OM Already Sent Today'
              )}
            </button>

            {/* Transaction Result */}
            {dailyTransactionResult && (
              <div style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                background: dailyTransactionResult.success ? 'var(--success-green)' : 'var(--error-red)',
                color: 'white',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {dailyTransactionResult.success ? '✅ Success!' : '❌ Error'}
                </div>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {dailyTransactionResult.message}
                </div>
                {dailyTransactionResult.txHash && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '500' }}>Transaction Hash:</div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem', 
                      wordBreak: 'break-all', 
                      marginBottom: '1rem',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {dailyTransactionResult.txHash}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigator.clipboard.writeText(dailyTransactionResult.txHash!)}
                        className="btn"
                        style={{ 
                          padding: '0.5rem 1rem', 
                          fontSize: '0.875rem',
                          background: 'var(--primary-blue)',
                          minHeight: 'auto'
                        }}
                      >
                        📋 Copy Hash
                      </button>
                      {dailyTransactionResult.txHash && 
                       dailyTransactionResult.txHash !== 'Transaction submitted' && 
                       dailyTransactionResult.txHash.length >= 32 && (
                        <a
                          href={`https://octrascan.io/tx/${dailyTransactionResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{ 
                            padding: '0.5rem 1rem', 
                            fontSize: '0.875rem',
                            background: '#8b5cf6',
                            textDecoration: 'none',
                            minHeight: 'auto'
                          }}
                        >
                          🔍 View on Explorer
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Daily OM Info */}
            <div style={{
              padding: '1.5rem',
              background: 'var(--primary-blue-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary-blue)'
            }}>
              <h4 style={{ color: 'var(--primary-blue)', fontWeight: '600', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                🌟 About Daily OM
              </h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Send a daily OM transaction to connect with the Octra network spiritually. 
                Each day, you can send one transaction that contributes to network harmony 
                and earns you karma points in the ecosystem. This practice helps maintain 
                the spiritual balance of the network while rewarding participants.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Wallet Modal */}
      {showImportWallet && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '32rem', position: 'relative', zIndex: 10002 }}>
            <div className="card-header">
              <h3 className="card-title">📥 Import Existing Wallet</h3>
              <p className="card-description">Enter your private key to import an existing wallet.</p>
            </div>
            <div className="card-content">
              <div className="field-group">
                <label className="field-label">🔐 Private Key</label>
                <textarea
                  value={importPrivateKey}
                  onChange={(e) => setImportPrivateKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-gray)',
                    borderRadius: 'var(--radius-md)',
                    height: '6rem',
                    resize: 'none',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter your private key (Base64 or Hex format)..."
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  💡 Supported formats: Base64 (44 characters) or Hex (64 characters)
                </div>
              </div>
              
              <div style={{
                background: 'var(--primary-blue-light)',
                border: '1px solid var(--primary-blue)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: 'var(--primary-blue)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  🔒 <strong>Security Notice:</strong> Enter your private key to import an existing wallet. 
                  Make sure you're in a secure environment and never share your private key with anyone.
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowImportWallet(false)
                    setImportPrivateKey('')
                    setError('')
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportWallet}
                  disabled={isImporting}
                  className="btn btn-primary"
                >
                  {isImporting ? 'Importing...' : 'Import Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Private Key Display Modal */}
      {showPrivateKey && currentWalletData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '48rem', position: 'relative', zIndex: 10000 }}>
            <div className="card-header">
              <h3 className="card-title">🎉 Wallet Created Successfully!</h3>
              <p className="card-description">Your new Octra wallet has been generated. Please save this information securely.</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1">
                <div className="field-group">
                  <label className="field-label">📍 Wallet Address</label>
                  <div className="field-value address">{currentWalletData.address}</div>
                </div>
                
                <div className="field-group">
                  <label className="field-label">🌐 Network Type</label>
                  <div className="field-value">{currentWalletData.networkType}</div>
                </div>
                
                <div className="field-group">
                  <label className="field-label">🔐 Private Key (Base64)</label>
                  <div className="field-value">{currentWalletData.private_key_b64}</div>
                </div>
                
                <div className="field-group">
                  <label className="field-label">🔑 Mnemonic Phrase</label>
                  <div className="field-value highlight">{currentWalletData.mnemonic?.join(' ')}</div>
                </div>
              </div>
              
              <div className="security-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>Critical Security Notice</h4>
                  <p>
                    Save your private key and mnemonic phrase in a secure location offline. 
                    Anyone with access to these can control your wallet and all its funds. 
                    Never share them with anyone or store them online.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setShowPrivateKey(false)}
                  className="btn btn-primary btn-large"
                >
                  ✅ I've Saved My Keys Securely
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleWallet