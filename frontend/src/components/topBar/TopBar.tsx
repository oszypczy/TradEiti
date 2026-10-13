import { useAuthContext } from "../../providers/authContext";
import { useNavigate } from "react-router-dom";
import "./TopBar.scss";

export const TopBar = () => {
  const { authenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const easteregg = () => {
    window.open("https://www.ptoszek.pl/");
  };
  return (
    <>
      <div className="topBar">
        <span>
          <b>Politechnikum Warszawskie</b> - Poboczny system uwierzytelniania
        </span>
        <span>
          <a onClick={() => navigate("/userPage")}>
            <b>Mój profil</b>
          </a>{" "}
          | <span onClick={easteregg}>🏴‍☠️</span> |{" "}
          {authenticated ? (
            <a className="logout" onClick={handleLogout}>
              Wyloguj się
            </a>
          ) : (
            <a onClick={() => navigate("/login")}>Zaloguj się</a>
          )}
        </span>
      </div>
    </>
  );
};
