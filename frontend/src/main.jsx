import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent extra queries on focus for mobile devices
      retry: 1, // Minimize retry attempts on slow networks
      staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)

