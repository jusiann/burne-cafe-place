import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import {Toaster} from 'sonner';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right" 
      toastOptions={{
        style: {
          background: '#F5F1EB',
          color: '#C46A2B',
          borderColor: '#C46A2B',
        },
        success: {
          iconTheme: {
            primary: '#C46A2B',
            secondary: '#F5F1EB',
          },
        },
        error: {
          iconTheme: {
            primary: '#8b4b1e',
            secondary: '#F5F1EB',
          },
        },
      }}
    />
  </StrictMode>,
);
