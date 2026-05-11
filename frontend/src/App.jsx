import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1C1C1C',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '2px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#00C853', secondary: '#000000' } },
              error: { iconTheme: { primary: '#FF3B30', secondary: '#FFFFFF' } },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
