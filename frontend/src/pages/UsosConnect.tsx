import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectUsos } from "../apiFunctions/connectUsos";
import { useAuthContext } from "../providers/authContext";
import "./auth.scss";

export function UsosConnect() {
  const navigate = useNavigate();
  const { authenticated, connectedToUsos, loading } = useAuthContext();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (authenticated === false) navigate("/login", { replace: true });
    else if (connectedToUsos) navigate("/", { replace: true });
  }, [authenticated, connectedToUsos, loading, navigate]);

  const connect = () => {
    setConnecting(true);
    setError("");
    connectUsos()
      .then((url) => {
        window.location.href = url;
      })
      .catch(() => {
        setConnecting(false);
        setError("Nie udało się połączyć z USOS. Spróbuj ponownie za chwilę.");
      });
  };

  return (
    <div className="centered">
      <div className="panel auth-panel wide">
        <img src="/plug.png" alt="" style={{ width: 120, height: "auto" }} />
        <h1>Połącz konto z USOS</h1>
        <p className="lead">
          Zostaniesz przekierowany do USOS, żeby wyrazić zgodę. Pobierzemy tylko Twoje przedmioty i grupy — bez hasła.
        </p>
        {connecting ? (
          <div className="connecting" role="status">
            <span className="spinner" />
            Łączenie z USOS…
          </div>
        ) : (
          <button type="button" className="btn primary" style={{ height: 48, padding: "0 28px" }} onClick={connect}>
            Połącz konto
          </button>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
