import { useState } from 'react'

function App() {
  const [wallet, setWallet] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [importKey, setImportKey] = useState('')
  const [isDailySending, setIsDailySending] = useState(false)
  const [dailyResult, setDailyResult] = useState(null)

  // Test with simple mock first
  const handleCreateWallet = async () => {
    setIsLoading(true)
    setError('')
    try {
      console.log('Creating wallet...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockWallet = {
        address: 'oct1234567890abcdef1234567890abcdef12345678',
        privateKey: 'mock_private_key_hex_format_64_characters_long_example_here',
        private_key_b64: 'bW9ja19wcml2YXRlX2tleV9iYXNlNjRfZm9ybWF0',
        mnemonic: ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident']
      }
      
      console.log('Mock wallet created:', mockWallet)
      setWallet(mockWallet)
    } catch (error) {
      console.error('Error creating wallet:', error)
      setError('Failed to create wallet: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportWallet = async () => {
    if (!importKey.trim()) {
      setError('Please enter a private key')
      return
    }
    setIsLoading(true)
    setError('')
    try {
      console.log('Importing wallet...')
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockWallet = {
        address: 'oct9876543210fedcba9876543210fedcba98765432',
        privateKey: importKey.trim(),
        private_key_b64: btoa(importKey.trim().slice(0, 32)),
        networkType: 'MainCoin'
      }
      
      console.log('Mock wallet imported:', mockWallet)
      setWallet(mockWallet)
      setShowImport(false)
      setImportKey('')
    } catch (error) {
      console.error('Error importing wallet:', error)
      setError('Failed to import wallet: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDailyOM = async () => {
    if (!wallet) {
      setError('Please create or import a wallet first')
      return
    }
    setIsDailySending(true)
    setDailyResult(null)
    try {
      console.log('Sending daily OM...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const success = Math.random() > 0.2 // 80% success rate
      const result = {
        success,
        message: success ? 'Daily OM transaction sent successfully! 🕉️' : 'Transaction failed. Please try again.',
        txHash: success ? 'tx_' + Math.random().toString(36).substr(2, 32) : undefined
      }
      
      console.log('Daily OM result:', result)
      setDailyResult(result)
    } catch (error) {
      console.error('Error sending daily OM:', error)
      setDailyResult({
        success: false,
        message: 'Transaction failed: ' + error.message
      })
    } finally {
      setIsDailySending(false)
    }
  }

  console.log('App rendering, wallet:', wallet)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1a1a1a',
      color: 'white',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          🕉️ Octra Wallet
        </h1>
        
        {/* Debug Info */}
        <div style={{
          background: '#333',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          fontSize: '0.8rem',
          textAlign: 'left'
        }}>
          <div>🔍 Debug Info:</div>
          <div>Buffer available: {typeof window.Buffer !== 'undefined' ? '✅' : '❌'}</div>
          <div>Process available: {typeof window.process !== 'undefined' ? '✅' : '❌'}</div>
          <div>Wallet state: {wallet ? '✅ Loaded' : '❌ None'}</div>
        </div>
        
        <div style={{
          background: 'white',
          color: '#333',
          padding: '2rem',
          borderRadius: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Wallet Management</h2>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Create or import your spiritual wallet
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{
                background: isLoading ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onClick={handleCreateWallet}
              disabled={isLoading}
              onMouseOver={(e) => !isLoading && (e.target.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              {isLoading ? '⏳ Creating...' : '🚀 Create Wallet'}
            </button>
            
            <button 
              style={{
                background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onClick={() => setShowImport(true)}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              📥 Import Wallet
            </button>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div style={{
            background: '#ff4444',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Wallet Display */}
        {wallet && (
          <div style={{
            background: 'white',
            color: '#333',
            padding: '2rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✅ Wallet Ready!</h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Address:</strong> 
              <div style={{ 
                fontFamily: 'monospace', 
                background: '#f0f0f0', 
                padding: '0.5rem', 
                borderRadius: '0.25rem',
                wordBreak: 'break-all',
                marginTop: '0.5rem'
              }}>
                {wallet.address}
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Private Key (Base64):</strong>
              <div style={{ 
                fontFamily: 'monospace', 
                background: '#f0f0f0', 
                padding: '0.5rem', 
                borderRadius: '0.25rem',
                wordBreak: 'break-all',
                marginTop: '0.5rem'
              }}>
                {wallet.private_key_b64}
              </div>
            </div>
            {wallet.mnemonic && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Mnemonic (12 words):</strong>
                <div style={{ 
                  background: '#e8f5e8', 
                  padding: '0.5rem', 
                  borderRadius: '0.25rem',
                  marginTop: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  {wallet.mnemonic.join(' ')}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{
          background: 'linear-gradient(45deg, #ff9a9e, #fecfef)',
          color: '#333',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🕉️ Daily OM</h3>
          <p style={{ marginBottom: '2rem' }}>
            Connect with the network spiritually
          </p>
          
          <button 
            style={{
              background: isDailySending ? '#ccc' : 'linear-gradient(45deg, #fa709a, #fee140)',
              color: 'white',
              border: 'none',
              padding: '1.5rem 3rem',
              borderRadius: '2rem',
              fontSize: '1.2rem',
              cursor: isDailySending || !wallet ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '300px',
              transition: 'all 0.3s',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onClick={handleDailyOM}
            disabled={isDailySending || !wallet}
            onMouseOver={(e) => {
              if (!isDailySending && wallet) {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)'
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {isDailySending ? '⏳ Sending OM...' : !wallet ? '🔒 Create Wallet First' : '🕉️ Say OM'}
          </button>

          {/* Daily Transaction Result */}
          {dailyResult && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              background: dailyResult.success ? '#10b981' : '#ef4444',
              color: 'white'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {dailyResult.success ? '✅ Success!' : '❌ Error'}
              </div>
              <div>{dailyResult.message}</div>
              {dailyResult.txHash && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontFamily: 'monospace', 
                  fontSize: '0.8rem',
                  wordBreak: 'break-all'
                }}>
                  TX: {dailyResult.txHash}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Import Modal */}
        {showImport && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '500px',
              width: '90%'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📥 Import Wallet</h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>
                Enter your private key (Base64 or Hex format):
              </p>
              <textarea
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
                placeholder="Enter private key..."
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem'
                }}
              />
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowImport(false)
                    setImportKey('')
                    setError('')
                  }}
                  style={{
                    background: '#ccc',
                    color: '#333',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportWallet}
                  disabled={isLoading}
                  style={{
                    background: isLoading ? '#ccc' : '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: '#00ff88',
          color: '#333',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginTop: '2rem',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          ✅ APP IS WORKING! ✅
        </div>
      </div>
    </div>
  )
}

export default App