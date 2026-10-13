import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../apiFunctions/login";
import { checkIfConnectedToUsos } from "../apiFunctions/checkIfConnectedToUsos";
import { saveToken } from "../auth/JwtToken";
import { useAuthContext } from "../providers/authContext";
import { UserCredentials } from "../models/UserCredentials";
import { statusOf } from "../utils/apiError";
import { AuthForm } from "./AuthForm";

export function Login() {
  const navigate = useNavigate();
  const { refresh, authenticated, connectedToUsos } = useAuthContext();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (authenticated && connectedToUsos) navigate("/", { replace: true });
  }, [authenticated, connectedToUsos, navigate]);

  const handleLogin = async (credentials: UserCredentials) => {
    if (!credentials.username || !credentials.password) {
      setError("Podaj nazwę użytkownika i hasło.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const { token } = await login(credentials);
      saveToken(token);
      const connected = await checkIfConnectedToUsos().then(
        () => true,
        () => false
      );
      refresh();
      navigate(connected ? "/" : "/usos-connect");
    } catch (err) {
      const status = statusOf(err);
      if (status === 503) setError("Komputer Artura zasypał śnieg.");
      else if (status === 401 || status === 403) setError("Login lub hasło niepoprawne.");
      else setError("Błąd logowania. Spróbuj ponownie.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthForm
      title="Zaloguj się"
      subtitle="Konto TradeEITI jest osobne od konta USOS."
      submitLabel="Zaloguj się"
      passwordAutocomplete="current-password"
      error={error}
      pending={pending}
      onSubmit={handleLogin}
      footer={
        <>
          Nie masz konta?{" "}
          <button type="button" className="link" onClick={() => navigate("/register")}>
            Zarejestruj się
          </button>
        </>
      }
    />
  );
}
