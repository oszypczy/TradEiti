import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, removeJwtToken } from "../auth/JwtToken";
import { checkIfConnectedToUsos } from "../apiFunctions/checkIfConnectedToUsos";
import { getUserData } from "../apiFunctions/getUserData";
import { UserData } from "../models/UserData";

// Hook for fetching current user data and checking if user is authenticated
// and connected to USOS. Call `refresh` after the stored token changes
// (login, register, username change, logout).
export function useCurrentUser() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<UserData | undefined>(
    undefined
  );
  const [authenticated, setAuthenticated] = useState<boolean | undefined>(
    () => (getToken() ? undefined : false)
  );
  const [connectedToUsos, setConnectedToUsos] = useState<boolean | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(() => getToken() !== null);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    queryClient.clear();
    if (getToken()) {
      setLoading(true);
      setVersion((v) => v + 1);
    } else {
      setCurrentUser(undefined);
      setAuthenticated(false);
      setConnectedToUsos(undefined);
      setLoading(false);
    }
  }, [queryClient]);

  const logout = useCallback(() => {
    removeJwtToken();
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;

    if (!getToken()) return;

    getUserData()
      .then(async (userData) => {
        if (cancelled) return;
        setCurrentUser(userData);
        setAuthenticated(true);
        const connected = await checkIfConnectedToUsos().then(
          () => true,
          () => false
        );
        if (cancelled) return;
        setConnectedToUsos(connected);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        removeJwtToken();
        setCurrentUser(undefined);
        setAuthenticated(false);
        setConnectedToUsos(undefined);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  return {
    currentUser,
    authenticated,
    loading,
    connectedToUsos,
    refresh,
    logout,
  };
}
