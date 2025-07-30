import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">O</div>
            <div className="logo-text">Octra Wallet</div>
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#" className="nav-link">Wallet</a></li>
              <li><a href="#" className="nav-link">Security</a></li>
              <li><a href="#" className="nav-link">Documentation</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
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

        {/* Test Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Wallet Management</h2>
            <p className="card-description">
              Create a new wallet or import an existing one to start your spiritual journey.
            </p>
          </div>
          <div className="card-content">
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-large">
                <span>🚀</span>
                <span>Create New Wallet</span>
              </button>
              
              <button className="btn btn-secondary btn-large">
                <span>📥</span>
                <span>Import Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 Octra Labs. Professional wallet management with enterprise-grade security.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;