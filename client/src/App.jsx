import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HouseSelection from "./pages/HouseSelection";
import HouseDetails from "./pages/HouseDetails";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import Payments from "./pages/Payments";
import AddPayment from "./pages/AddPayment";
import MyPayments from "./pages/MyPayments";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AIPage from "./pages/AIPage";

import AIButton from "./components/AIButton";
import GuidePage from "./pages/GuidePage";
import NotesPage from "./pages/NotesPage";

// مكون الحماية للصفحات
const ProtectedRoute = ({ children, requireHouse = true }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" />;
  }
  // If user doesn't have a house, redirect to house selection
  if (requireHouse && !user.house) {
    return <Navigate to="/house-selection" />;
  }
  return (
    <>
      {children}
      {requireHouse && location.pathname !== "/ai" && <AIButton />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen flex flex-col font-primary">
              <Navbar />
              <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/house-selection"
                    element={
                      <ProtectedRoute requireHouse={false}>
                        <HouseSelection />
                      </ProtectedRoute>
                    }
                  />
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
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <ProtectedRoute>
                        <About />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/house-details"
                    element={
                      <ProtectedRoute>
                        <HouseDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/ai"
                    element={
                      <ProtectedRoute>
                        <AIPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/guide"
                    element={
                      <ProtectedRoute>
                        <GuidePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notes"
                    element={
                      <ProtectedRoute>
                        <NotesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notes"
                    element={
                      <ProtectedRoute>
                        <NotesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <ProtectedRoute>
                        <NotFound />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
