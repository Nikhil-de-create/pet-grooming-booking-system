import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      background: 'white'
    }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
    </div>
  );
}

export default TestApp;