import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Members from './pages/Members';
import Payments from './pages/Payments';
import AddPayment from './pages/AddPayment';
import MyPayments from './pages/MyPayments';
import Analytics from './pages/Analytics';

// مكون الحماية للصفحات
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute>
                      <Expenses />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-expense"
                  element={
                    <ProtectedRoute>
                      <AddExpense />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-payments"
                  element={
                    <ProtectedRoute>
                      <MyPayments />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-payment"
                  element={
                    <ProtectedRoute>
                      <AddPayment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <Members />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
