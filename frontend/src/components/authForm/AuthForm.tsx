import { SubmitHandler, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { UserCredentials } from "../../models/UserCredentials";
import "./style.scss";

interface AuthFormProps {
  handleOnSubmit: (values: UserCredentials) => void;
  errorMessage: string;
}

export function AuthForm({ handleOnSubmit, errorMessage }: AuthFormProps) {
  const { register, handleSubmit } = useForm<UserCredentials>();

  const location = useLocation();
  const isRegisterPage = location.pathname.includes("/register");

  const onSubmit: SubmitHandler<UserCredentials> = (values) => {
    return handleOnSubmit(values);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nazwa użytkownika: </label>
        <br />
        <input {...register("username", { required: true })} />
        <br />
        <p className="errorMessage">{errorMessage && <b>{errorMessage}</b>}</p>
      </div>
      <div>
        <label>Hasło: </label>
        <br />
        <input
          type="password"
          {...register("password", { required: true })}
        />
      </div>
      <button id="loginButton" type="submit">
        {isRegisterPage ? "Rejestruj" : "Zaloguj"}
      </button>
    </form>
  );
}
