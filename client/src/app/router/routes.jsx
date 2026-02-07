import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import {
  LoginPage as Login,
  RegisterPage as Register,
  ForgotPasswordPage as ForgotPassword,
  ResetPasswordPage as ResetPassword,
} from "../../modules/auth/pages";
import { HouseSelectionPage as HouseSelection, HouseDetailsPage as HouseDetails } from "../../modules/house/pages";
import { DashboardPage as Dashboard } from "../../modules/dashboard/pages";
import { ExpensesPage as Expenses, AddExpensePage as AddExpense } from "../../modules/expenses/pages";
import { MyInvoicesPage as MyInvoices, AllInvoicesPage as AllInvoices } from "../../modules/invoices/pages";
import { NotesPage } from "../../modules/notes/pages";
import { AIPage } from "../../modules/ai/pages";
import { AnalyticsPage } from "../../modules/analytics/pages";
import { ProfilePage } from "../../modules/profile/pages";
import { AboutPage, ContactDeveloperPage, GuidePage } from "../../modules/info/pages";
import { NotFoundPage } from "../pages";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
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
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <ContactDeveloperPage />
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
        path="/ai"
        element={
          <ProtectedRoute>
            <AIPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <NotFoundPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
