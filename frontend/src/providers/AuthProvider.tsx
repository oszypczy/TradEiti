import { useCurrentUser } from "../hooks/useCurrentUser";
import { AuthContext } from "./authContext";

interface Props {
  children: React.ReactNode;
}

// Provider for authentication and user data
export function AuthProvider({ children }: Props) {
  const state = useCurrentUser();
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
