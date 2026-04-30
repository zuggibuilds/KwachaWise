import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './lib/auth';
import './styles/index.css';
import './styles/kwachawise_v2.css';
import ToastManager from './components/ui/ToastManager';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastManager />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
