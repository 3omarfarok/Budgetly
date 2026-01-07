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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HouseSelection from "./pages/HouseSelection";
import HouseDetails from "./pages/HouseDetails";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import MyInvoices from "./pages/MyInvoices";
import AllInvoices from "./pages/AllInvoices";

import GuidePage from "./pages/GuidePage";
import NotesPage from "./pages/NotesPage";
import ContactDeveloper from "./pages/ContactDeveloper";

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
      {requireHouse && location.pathname !== "/ai"}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Router>
              <div className="min-h-screen flex flex-col md:flex-row font-primary bg-(--color-bg)">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                  <Navbar />
                  <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route
                        path="/reset-password/:token"
                        element={<ResetPassword />}
                      />
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
                        path="/my-invoices"
                        element={
                          <ProtectedRoute>
                            <MyInvoices />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/all-invoices"
                        element={
                          <ProtectedRoute>
                            <AllInvoices />
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
                        path="/contact"
                        element={
                          <ProtectedRoute>
                            <ContactDeveloper />
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
              </div>
            </Router>
          </ToastProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
