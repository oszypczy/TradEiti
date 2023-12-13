import "./App.css";
import { AppLayout } from "./common/appLayout/AppLayout";
import Authorized from "./common/authorized/Authorized";
import { Footer } from "./components/footer/Footer";
import { PwBar } from "./components/pwBar/PwBar";
import { TopBar } from "./components/topBar/TopBar";
import { NavBar } from "./components/navBar/NavBar";
import { Providers } from "./providers/Providers";
import { RoutesProvider } from "./providers/RoutesProvider";
import { HashRouter } from "react-router-dom";

// Main entrance to the application
function App() {
  return (
    <HashRouter>
      <AppLayout>
        <Providers>
          <Authorized isAuthorized={<TopBar />} />
          <Authorized isAuthorized={<PwBar />} />
          <NavBar />
          <main id="mainRoot">
            <RoutesProvider />
          </main>
          <Footer />
        </Providers>
      </AppLayout>
    </HashRouter>
  );
}

export default App;
