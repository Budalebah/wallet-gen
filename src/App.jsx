function App() {
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
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onClick={() => alert('Create Wallet!')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              🚀 Create Wallet
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
              onClick={() => alert('Import Wallet!')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              📥 Import Wallet
            </button>
          </div>
        </div>
        
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
              background: 'linear-gradient(45deg, #fa709a, #fee140)',
              color: 'white',
              border: 'none',
              padding: '1.5rem 3rem',
              borderRadius: '2rem',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
              maxWidth: '300px',
              transition: 'all 0.3s',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
            onClick={() => alert('OM sent! 🕉️')}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)'
              e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            🕉️ Say OM
          </button>
        </div>
        
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