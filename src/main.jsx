import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/global.css';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <App />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.88rem',
                borderRadius: '12px',
                background: '#1c1917',
                color: '#fff',
              },
              success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
              error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
            }}
          />
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
