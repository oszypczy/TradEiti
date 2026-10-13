import { createContext, useContext } from "react";
import { UserData } from "../models/UserData";

export interface AuthState {
  authenticated: boolean | undefined;
  currentUser: UserData | undefined;
  loading: boolean;
  connectedToUsos: boolean | undefined;
  refresh: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  authenticated: undefined,
  currentUser: undefined,
  loading: true,
  connectedToUsos: undefined,
  refresh: () => {},
  logout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
