import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'sonner';

function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  return (
    <AuthProvider>
      <Toaster position="top-right" theme="system" richColors closeButton expand={false} className="font-sans" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
