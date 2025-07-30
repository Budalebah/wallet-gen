import React from 'react';
import './App.css';

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-default-color)', color: 'white', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '2rem' }}>
        🕉️ Octra OM Wallet
      </h1>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          background: 'var(--gray-0)', 
          color: 'var(--text-main)',
          padding: '2rem', 
          borderRadius: '1rem', 
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Wallet Management</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Create a new wallet or import an existing one to start your spiritual journey.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              style={{
                background: 'var(--blue-50-base)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => alert('Create Wallet clicked!')}
            >
              🚀 Create New Wallet
            </button>
            
            <button 
              style={{
                background: 'var(--gray-0)',
                color: 'var(--text-main)',
                border: '2px solid var(--blue-50-base)',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
              onClick={() => alert('Import Wallet clicked!')}
            >
              📥 Import Wallet
            </button>
          </div>
        </div>
        
        <div style={{ 
          background: 'var(--gray-0)', 
          color: 'var(--text-main)',
          padding: '2rem', 
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>🕉️ Daily OM Transaction</h3>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Send your daily OM to connect with the network's spiritual energy.
          </p>
          
          <button 
            style={{
              background: 'linear-gradient(135deg, var(--orange-30), var(--orange-40))',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              width: '100%'
            }}
            onClick={() => alert('Daily OM clicked!')}
          >
            🕉️ Say OM - Send Daily Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;