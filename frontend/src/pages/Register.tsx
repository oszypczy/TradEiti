import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../apiFunctions/register";
import { saveToken } from "../auth/JwtToken";
import { useAuthContext } from "../providers/authContext";
import { UserCredentials } from "../models/UserCredentials";
import { statusOf } from "../utils/apiError";
import { AuthForm } from "./AuthForm";

export const MIN_PASSWORD_LENGTH = 6;

export function Register() {
  const navigate = useNavigate();
  const { refresh } = useAuthContext();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const handleRegister = async (credentials: UserCredentials) => {
    if (!credentials.username || !credentials.password) {
      setError("Podaj nazwę użytkownika i hasło.");
      return;
    }
    if (credentials.password.length < MIN_PASSWORD_LENGTH) {
      setError(`Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`);
      return;
    }
    setPending(true);
    setError("");
    try {
      const { token } = await register(credentials);
      saveToken(token);
      refresh();
      navigate("/usos-connect");
    } catch (err) {
      const status = statusOf(err);
      if (status === 409) setError("Nazwa użytkownika jest zajęta.");
      else if (status === 400) setError("Nieprawidłowa nazwa użytkownika lub hasło.");
      else if (status === 503) setError("Komputer Artura zasypał śnieg.");
      else setError("Błąd rejestracji. Spróbuj ponownie.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthForm
      title="Załóż konto"
      subtitle="Po rejestracji połączysz konto z USOS, żeby pobrać swój plan."
      submitLabel="Zarejestruj się"
      passwordHint="Nie używaj hasła z USOS."
      passwordAutocomplete="new-password"
      error={error}
      pending={pending}
      onSubmit={handleRegister}
      footer={
        <>
          Masz już konto?{" "}
          <button type="button" className="link" onClick={() => navigate("/login")}>
            Zaloguj się
          </button>
        </>
      }
    />
  );
}
