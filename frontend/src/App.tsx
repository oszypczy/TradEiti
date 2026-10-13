import { HashRouter } from "react-router-dom";
import { Providers } from "./providers/Providers";
import { RoutesProvider } from "./providers/RoutesProvider";
import { AppShell } from "./components/layout/AppShell";

// Main entrance to the application
function App() {
  return (
    <HashRouter>
      <Providers>
        <AppShell>
          <RoutesProvider />
        </AppShell>
      </Providers>
    </HashRouter>
  );
}

export default App;
