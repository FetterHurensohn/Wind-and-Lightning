import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#1a1a1a',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <h1 style={{ fontSize: '48px', margin: 0 }}>Professional Video Editor</h1>
      <p style={{ fontSize: '24px', color: '#888' }}>Loading...</p>
      <div style={{ 
        width: '80%', 
        height: '600px', 
        background: '#252525',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#666' }}>UI wird geladen...</p>
      </div>
    </div>
  );
};

export default App;
