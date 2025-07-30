import { useState, useEffect } from 'react'
import {
  generateOctraWallet,
  importOctraWallet,
  sendDailyTransaction,
  checkDailyTransactionStatus,
  getBalanceAndNonce
} from '../utils/octraWallet'

const SimpleWallet = () => {
  // Wallet State
  const [activeWallet, setActiveWallet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [currentWalletData, setCurrentWalletData] = useState<any>(null)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🕉️ Octra OM Wallet</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowImportWallet(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Wallet Info */}
      {activeWallet && (
        <div className="card">
          <div className="card-content">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Wallet Information</h3>
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
                       dailyTransactionResult.txHash.length >= 32 && (
                        <a
                          href={`https://octrascan.io/tx/${dailyTransactionResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors inline-block"
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