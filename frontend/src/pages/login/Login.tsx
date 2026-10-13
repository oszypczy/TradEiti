import "./style.scss";
import { Image } from "../../common/image/Image";
import { AuthForm } from "../../components/authForm/AuthForm";
import { UserCredentials } from "../../models/UserCredentials";
import { login } from "../../apiFunctions/login";
import { saveToken } from "../../auth/JwtToken";
import { useState } from "react";
import { checkIfConnectedToUsos } from "../../apiFunctions/checkIfConnectedToUsos";
import { useAuthContext } from "../../providers/authContext";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

export const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { refresh } = useAuthContext();

  const handleLogin = (userCredentials: UserCredentials) => {
    login(userCredentials)
      .then(async (response) => {
        if (!response.token) return;
        saveToken(response.token);
        const connected = await checkIfConnectedToUsos().then(
          () => true,
          () => false
        );
        refresh();
        navigate(connected ? "/" : "/usos-connect");
      })
      .catch((err) => {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 503) {
          setErrorMessage("Komputer Artura zasypał śnieg.");
        } else if (status === 401 || status === 403) {
          setErrorMessage("Login lub hasło niepoprawne.");
        } else {
          setErrorMessage("Błąd logowania.");
        }
      });
  };

  return (
    <article className="login">
      <Image src="TradeEITI.png" />
      <div className="formDiv">
        <h2>Login</h2>
        <AuthForm handleOnSubmit={handleLogin} errorMessage={errorMessage} />
        <button className="regButton" onClick={() => navigate("/register")}>
          Zarejestruj się
        </button>
      </div>
    </article>
  );
};
