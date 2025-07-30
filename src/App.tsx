import React from 'react';
import SimpleWallet from './components/SimpleWallet';
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
        <SimpleWallet />
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