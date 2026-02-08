import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../shared/context/AuthContext";
import { ThemeProvider } from "../../shared/context/ThemeContext";
import { ToastProvider } from "../../shared/context/ToastContext";

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
