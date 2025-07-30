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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>🕉️ Octra OM Wallet</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowImportWallet(true)}
            className="btn btn-secondary"
          >
            Import Wallet
          </button>

          <button
            onClick={handleCreateWallet}
            disabled={isLoading}
            className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
          {activeWallet && (
            <button
              onClick={fetchBalance}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Balance
            </button>
          )}
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
          {error}
        </div>
      )}

      {/* Wallet Info */}
      {activeWallet && (
        <div className="card">
          <div className="card-content">
            <h3 className="card-title">Wallet Information</h3>
            <div className="grid grid-cols-2">
              <div>
                <p className="field-label">Address:</p>
                <p className="field-value">{activeWallet.address}</p>
              </div>
              <div>
                <p className="field-label">Balance:</p>
                <p className={`field-value ${parseFloat(balance) > 0 ? 'highlight' : 'status-invalid'}`}>
                  {balance} OCT
                </p>
                {parseFloat(balance) <= 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--error-red)', marginTop: '0.25rem' }}>
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
          <div className="card-content">
            <h3 className="card-title">
              🕉️ Daily OM Transaction
            </h3>
            
            {/* Daily Status */}
            <div style={{ 
              background: 'var(--light-gray)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              border: '1px solid var(--border-gray)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '500' }}>Today's Status:</span>
                <span className={`${
                  dailyTransactionStatus.canSendToday 
                    ? 'status-valid' 
                    : 'status-invalid'
                }`} style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '9999px', 
                  fontSize: '0.875rem',
                  background: dailyTransactionStatus.canSendToday ? 'var(--success-green)' : 'var(--warning-orange)',
                  color: 'white'
                }}>
                  {dailyTransactionStatus.canSendToday ? 'Available' : 'Already Sent Today'}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <div>Daily Count: {dailyTransactionStatus.dailyCount}</div>
                {dailyTransactionStatus.lastTransactionDate && (
                  <div>Last Transaction: {new Date(dailyTransactionStatus.lastTransactionDate).toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Say OM Button */}
            <button
              onClick={handleSendDailyTransaction}
              disabled={isDailySending || !dailyTransactionStatus.canSendToday || parseFloat(balance) <= 0}
              className={`btn btn-full btn-large ${
                dailyTransactionStatus.canSendToday && !isDailySending && parseFloat(balance) > 0
                  ? 'btn-primary'
                  : ''
              }`}
              style={{
                background: dailyTransactionStatus.canSendToday && !isDailySending && parseFloat(balance) > 0
                  ? 'linear-gradient(135deg, var(--warning-orange), var(--error-red))'
                  : 'var(--secondary-gray)',
                marginBottom: '1rem'
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
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: dailyTransactionResult.success ? 'var(--success-green)' : 'var(--error-red)',
                color: 'white',
                marginBottom: '1rem'
              }}>
                <div style={{ fontWeight: '500' }}>
                  {dailyTransactionResult.success ? '✓ Success!' : '✗ Error'}
                </div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {dailyTransactionResult.message}
                </div>
                {dailyTransactionResult.txHash && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Transaction Hash:</div>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem', 
                      wordBreak: 'break-all', 
                      marginBottom: '0.75rem' 
                    }}>
                      {dailyTransactionResult.txHash}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => navigator.clipboard.writeText(dailyTransactionResult.txHash!)}
                        className="btn"
                        style={{ 
                          padding: '0.25rem 0.75rem', 
                          fontSize: '0.75rem',
                          background: 'var(--primary-blue)'
                        }}
                      >
                        Copy Hash
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
                            padding: '0.25rem 0.75rem', 
                            fontSize: '0.75rem',
                            background: '#8b5cf6',
                            textDecoration: 'none'
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
              padding: '1rem',
              background: 'var(--primary-blue-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-blue)'
            }}>
              <h4 style={{ color: 'var(--primary-blue)', fontWeight: '500', marginBottom: '0.5rem' }}>🌟 About Daily OM</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Send a daily OM transaction to connect with the Octra network spiritually. 
                Each day, you can send one free transaction that contributes to network harmony 
                and earns you karma points in the ecosystem.
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
          <div className="card" style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 10002 }}>
            <div className="card-content">
              <h3 className="card-title">Import Wallet</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label className="field-label">Private Key</label>
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
                    fontFamily: 'monospace'
                  }}
                  placeholder="Enter your private key (Base64 format)..."
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  💡 Supported formats: Base64 (44 characters) or Hex (128 characters)
                </div>
              </div>
              <div style={{
                background: 'var(--primary-blue-light)',
                border: '1px solid var(--primary-blue)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <p style={{ color: 'var(--primary-blue)', fontSize: '0.875rem' }}>
                  💡 Enter your private key to import an existing wallet. 
                  Make sure you're in a secure environment.
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
            <div className="card-content">
              <h3 className="card-title">🔐 Wallet Created Successfully!</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="field-group">
                  <p className="field-label">Address:</p>
                  <p className="field-value">{currentWalletData.address}</p>
                </div>
                <div className="field-group">
                  <p className="field-label">Network Type:</p>
                  <p className="field-value">{currentWalletData.networkType}</p>
                </div>
                <div className="field-group">
                  <p className="field-label">Private Key (Base64):</p>
                  <p className="field-value">{currentWalletData.private_key_b64}</p>
                </div>
                <div className="field-group">
                  <p className="field-label">Mnemonic Phrase:</p>
                  <p className="field-value">{currentWalletData.mnemonic?.join(' ')}</p>
                </div>
              </div>
              
              <div className="security-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <h4>Security Notice</h4>
                  <p>Save your private key and mnemonic phrase in a secure location. 
                  Anyone with access to these can control your wallet. Never share them with anyone.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setShowPrivateKey(false)}
                  className="btn btn-primary"
                >
                  I've Saved My Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address:</p>
                <p className="font-mono text-gray-800 break-all">{activeWallet.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Balance:</p>
                <p className={`text-lg font-bold ${parseFloat(balance) > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {balance} OCT
                </p>
                {parseFloat(balance) <= 0 && (
                  <p className="text-xs text-red-600 mt-1">
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
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🕉️ Daily OM Transaction
            </h3>
            
            {/* Daily Status */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-800 font-medium">Today's Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  dailyTransactionStatus.canSendToday 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {dailyTransactionStatus.canSendToday ? 'Available' : 'Already Sent Today'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Daily Count: {dailyTransactionStatus.dailyCount}</div>
                {dailyTransactionStatus.lastTransactionDate && (
                  <div>Last Transaction: {new Date(dailyTransactionStatus.lastTransactionDate).toLocaleString()}</div>
                )}
              </div>
            </div>

            {/* Say OM Button */}
            <button
              onClick={handleSendDailyTransaction}
              disabled={isDailySending || !dailyTransactionStatus.canSendToday || parseFloat(balance) <= 0}
              className={`w-full px-6 py-4 rounded-lg font-medium text-lg transition-all ${
                dailyTransactionStatus.canSendToday && !isDailySending && parseFloat(balance) > 0
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isDailySending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
              <div className={`mt-4 p-4 rounded-lg ${
                dailyTransactionResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  dailyTransactionResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {dailyTransactionResult.success ? '✓ Success!' : '✗ Error'}
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {dailyTransactionResult.message}
                </div>
                {dailyTransactionResult.txHash && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-600 mb-2">Transaction Hash:</div>
                    <div className="font-mono text-xs text-gray-800 break-all mb-3">
                      {dailyTransactionResult.txHash}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(dailyTransactionResult.txHash!)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                      >
                        Copy Hash
                      </button>
                      {dailyTransactionResult.txHash && 
                       dailyTransactionResult.txHash !== 'Transaction submitted' && 
          <button
            onClick={handleCreateWallet}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Wallet'}
          </button>
          {activeWallet && (
            <button
              onClick={fetchBalance}
              className="btn btn-secondary"
            >
              Refresh Balance
            </button>
          )}

            {/* Daily OM Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-gray-800 font-medium mb-2">🌟 About Daily OM</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Send a daily OM transaction to connect with the Octra network spiritually. 
                Each day, you can send one free transaction that contributes to network harmony 
                and earns you karma points in the ecosystem.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Wallet Modal */}
      {showImportWallet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Import Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Private Key</label>
                <textarea
                  value={importPrivateKey}
                  onChange={(e) => setImportPrivateKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800 h-24 resize-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                  placeholder="Enter your private key (Base64 format)..."
                />
                <div className="mt-2 text-xs text-gray-600">
                  💡 Supported formats: Base64 (44 characters) or Hex (64 characters)
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm">
                  💡 Enter your private key to import an existing wallet. 
                  Make sure you're in a secure environment.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowImportWallet(false)
                  setImportPrivateKey('')
                  setError('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportWallet}
                disabled={isImporting}
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import Wallet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Private Key Display Modal */}
      {showPrivateKey && currentWalletData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🔐 Wallet Created Successfully!</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Address:</p>
                <p className="font-mono text-gray-800 break-all">{currentWalletData.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Network Type:</p>
                <p className="text-gray-800">{currentWalletData.networkType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Private Key (Base64):</p>
                <p className="font-mono text-gray-800 break-all">{currentWalletData.private_key_b64}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mnemonic Phrase:</p>
                <p className="font-mono text-gray-800 break-all">{currentWalletData.mnemonic?.join(' ')}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ <strong>Security Notice:</strong> Save your private key and mnemonic phrase in a secure location. 
                Anyone with access to these can control your wallet. Never share them with anyone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPrivateKey(false)}
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-hover transition-colors"
              >
                I've Saved My Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleWallet