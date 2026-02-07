import { BrowserRouter as Router } from "react-router-dom";
import AppProviders from "./app/providers/AppProviders";
import AppShell from "./app/layout/AppShell";

function App() {
  return (
    <AppProviders>
      <Router>
        <AppShell />
      </Router>
    </AppProviders>
  );
}

export default App;
