import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#181818', 
      color: 'white', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        fontSize: '3rem', 
        marginBottom: '2rem',
        fontWeight: 'bold'
      }}>
        🕉️ Octra OM Wallet
      </h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          background: '#ffffff', 
          color: '#222222',
          padding: '2rem', 
          borderRadius: '1rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Wallet Management
          </h2>
          <p style={{ marginBottom: '2rem', color: '#64748b', lineHeight: '1.6' }}>
            Create a new wallet or import an existing one to start your spiritual journey.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{
                background: '#0000db',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onClick={() => alert('Create Wallet clicked!')}
              onMouseOver={(e) => e.target.style.background = '#043aff'}
              onMouseOut={(e) => e.target.style.background = '#0000db'}
            >
              🚀 Create New Wallet
            </button>
            
            <button 
              style={{
                background: '#ffffff',
                color: '#0000db',
                border: '2px solid #0000db',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onClick={() => alert('Import Wallet clicked!')}
              onMouseOver={(e) => e.target.style.background = '#ecf2ff'}
              onMouseOut={(e) => e.target.style.background = '#ffffff'}
            >
              📥 Import Wallet
            </button>
          </div>
        </div>
        
        <div style={{ 
          background: '#ffffff', 
          color: '#222222',
          padding: '2rem', 
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            🕉️ Daily OM Transaction
          </h3>
          <p style={{ marginBottom: '2rem', color: '#64748b', lineHeight: '1.6' }}>
            Send your daily OM to connect with the network's spiritual energy.
          </p>
          
          <button 
            style={{
              background: 'linear-gradient(135deg, #ef8b17, #d97400)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onClick={() => alert('Daily OM clicked!')}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🕉️ Say OM - Send Daily Transaction
          </button>
        </div>
        
        {/* Test Section */}
        <div style={{ 
          background: '#ffffff', 
          color: '#222222',
          padding: '2rem', 
          borderRadius: '1rem',
          marginTop: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            🧪 Test Section
          </h3>
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>
            If you can see this section, the app is working correctly!
          </p>
          <div style={{ 
            background: '#10b981', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            ✅ App is rendering successfully!
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;