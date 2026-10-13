import "./style.scss";
import { Image } from "../../common/image/Image";
import { AuthForm } from "../../components/authForm/AuthForm";
import { register } from "../../apiFunctions/register";
import { UserCredentials } from "../../models/UserCredentials";
import { saveToken } from "../../auth/JwtToken";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useAuthContext } from "../../providers/authContext";

export const Register = () => {
  const navigate = useNavigate();
  const { refresh } = useAuthContext();
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = (userCredentials: UserCredentials) => {
    register(userCredentials)
      .then((response) => {
        if (response.token) {
          saveToken(response.token);
          refresh();
          navigate("/usos-connect");
        }
      })
      .catch((err) => {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 503) {
          setErrorMessage("Komputer Artura zasypał śnieg.");
        } else if (status === 409) {
          setErrorMessage("Nazwa użytkownika jest zajęta.");
        } else if (status === 400) {
          setErrorMessage("Niepoprawna nazwa użytkownika lub hasło.");
        } else {
          setErrorMessage("Błąd rejestracji.");
        }
      });
  };

  return (
    <article className="login">
      <Image src="TradeEITI.png" />
      <br></br>
      <div className="formDiv">
        <h2>Rejestracja</h2>
        <AuthForm handleOnSubmit={handleRegister} errorMessage={errorMessage} />
        <button className="regButton" onClick={() => navigate("/login")}>
          Powrót
        </button>
      </div>
    </article>
  );
};
