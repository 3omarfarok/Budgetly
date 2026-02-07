import { Navbar, Sidebar } from "../../shared/components";
import AppRoutes from "../router/routes";

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-primary bg-(--color-bg)">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
