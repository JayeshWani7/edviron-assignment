import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import SchoolTransactionsPage from './pages/SchoolTransactionsPage';
import TransactionStatusPage from './pages/TransactionStatusPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                }}
              />
              
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/payments/callback/success" element={<PaymentSuccessPage />} />
                <Route path="/payments/callback/failure" element={<PaymentFailurePage />} />
                <Route path="/test" element={
                  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Frontend is Working! 🎉
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        This confirms the React app is running properly.
                      </p>
                      <div className="mt-6 space-x-4">
                        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                          Go to Login
                        </a>
                        <a href="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                          Go to Register
                        </a>
                      </div>
                    </div>
                  </div>
                } />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="school-transactions" element={<SchoolTransactionsPage />} />
                  <Route path="status-check" element={<TransactionStatusPage />} />
                  <Route path="payments" element={<PaymentsPage />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
