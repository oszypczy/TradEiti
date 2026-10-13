import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../providers/authContext";
import { useNavCounts } from "../../hooks/useNavCounts";
import { avatarSrc } from "../../utils/avatars";
import "./layout.scss";

// Which sidebar entry a route belongs to (sub-pages highlight their parent).
function sectionOf(pathname: string): string {
  if (pathname.startsWith("/myOffers")) return "/myOffers";
  if (pathname.startsWith("/finalizedOffers")) return "/finalizedOffers";
  if (pathname.startsWith("/offers") || pathname.startsWith("/fittingOffers")) return "/offers";
  if (pathname.startsWith("/modifyUser") || pathname.startsWith("/userPage")) return "/userPage";
  return pathname;
}

function Logo({ width }: { width?: number }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="logo" onClick={() => navigate("/")} aria-label="TradeEITI — strona główna">
      <img src="/TradeEITI.png" alt="TradeEITI" style={width ? { width } : undefined} />
    </button>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentUser, logout } = useAuthContext();
  const { fitting, approvals } = useNavCounts();
  const section = sectionOf(pathname);

  const items: { path: string; label: string; badge?: number; alert?: boolean }[] = [
    { path: "/", label: "Home" },
    { path: "/offers", label: "Rynek ofert", badge: fitting },
    { path: "/myOffers", label: "Moje oferty", badge: approvals, alert: true },
    { path: "/offerRequests", label: "Wysłane oferty" },
    { path: "/finalizedOffers", label: "Zakończone wymiany" },
    { path: "/courses", label: "Kursy" },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-stripe" />
      <div className="sidebar-logo">
        <Logo />
      </div>
      <nav aria-label="Menu główne">
        {items.map((item) => (
          <button
            key={item.path}
            type="button"
            className={`nav-item ${section === item.path ? "active" : ""}`}
            aria-current={section === item.path ? "page" : undefined}
            onClick={() => navigate(item.path)}
          >
            <span>{item.label}</span>
            {item.badge ? <span className={`badge ${item.alert ? "alert" : ""}`}>{item.badge}</span> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-user">
        <button
          type="button"
          className={`profile-button ${section === "/userPage" ? "active" : ""}`}
          onClick={() => navigate("/userPage")}
        >
          <img src={avatarSrc(currentUser?.avatar)} alt="" />
          <span>
            <span className="name">{currentUser?.username}</span>
            <span className="sub">Mój profil</span>
          </span>
        </button>
        <button
          type="button"
          className="logout"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Wyloguj się
        </button>
      </div>
    </aside>
  );
}

function PublicHeader() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { authenticated, logout } = useAuthContext();

  const links: { label: string; onClick: () => void; path?: string; primary?: boolean }[] = authenticated
    ? [
        { label: "Home", path: "/", onClick: () => navigate("/") },
        { label: "Połącz z USOS", path: "/usos-connect", onClick: () => navigate("/usos-connect"), primary: true },
        {
          label: "Wyloguj się",
          onClick: () => {
            logout();
            navigate("/login");
          },
        },
      ]
    : [
        { label: "Home", path: "/", onClick: () => navigate("/") },
        { label: "Zaloguj się", path: "/login", onClick: () => navigate("/login") },
        { label: "Zarejestruj się", path: "/register", onClick: () => navigate("/register"), primary: true },
      ];

  return (
    <header className="public-header">
      <div className="brand-stripe" />
      <div className="public-header-inner">
        <Logo />
        <nav aria-label="Menu">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              className={`pub-link ${link.primary ? "primary" : pathname === link.path ? "active" : ""}`}
              onClick={link.onClick}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logoPW.png" alt="" />
          <span>
            <b>Politechnikum Warszawskie</b> · Poboczny system uwierzytelniania
          </span>
        </div>
        <span className="mono">TradeEITI · pl. Marcina 21, Warniawa · trade.eiti</span>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { authenticated, connectedToUsos, loading } = useAuthContext();
  const signedIn = !loading && authenticated && connectedToUsos;

  return (
    <div className={`shell ${signedIn ? "with-sidebar" : ""}`}>
      {signedIn ? <Sidebar /> : <PublicHeader />}
      <main className="content">
        <div className="content-inner">{children}</div>
        <Footer />
      </main>
    </div>
  );
}
