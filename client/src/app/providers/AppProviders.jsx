import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../context/AuthContext";
import { ThemeProvider } from "../../context/ThemeContext";
import { ToastProvider } from "../../context/ToastContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
