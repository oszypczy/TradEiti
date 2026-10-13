import { FormEvent, ReactNode, useState } from "react";
import { UserCredentials } from "../models/UserCredentials";
import "./auth.scss";

interface Props {
  title: string;
  subtitle: string;
  submitLabel: string;
  passwordHint?: string;
  passwordAutocomplete: "current-password" | "new-password";
  error: string;
  pending: boolean;
  onSubmit: (credentials: UserCredentials) => void;
  footer: ReactNode;
}

export function AuthForm(props: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    props.onSubmit({ username: username.trim(), password });
  };

  return (
    <div className="centered">
      <form className="panel auth-panel" onSubmit={submit} noValidate>
        <header>
          <h1>{props.title}</h1>
          <p>{props.subtitle}</p>
        </header>
        <label className="field">
          Nazwa użytkownika
          <input
            className="input"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="field">
          Hasło
          <input
            className="input"
            name="password"
            type="password"
            autoComplete={props.passwordAutocomplete}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {props.passwordHint && <span className="hint">{props.passwordHint}</span>}
        </label>
        {props.error && (
          <div className="form-error" role="alert">
            {props.error}
          </div>
        )}
        <button type="submit" className="btn primary block" disabled={props.pending}>
          {props.submitLabel}
        </button>
        <div className="switch">{props.footer}</div>
      </form>
    </div>
  );
}
