import { ComponentType, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../providers/authContext";
import { Loading } from "../../components/ui/Loading";

const login = "/login?redirected=true";
const usosConnect = "/usos-connect";

// HOC rendering the page only if the user is logged in and connected to USOS;
// otherwise redirects to the login / USOS connection page.
export function withPrivateRoute<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function PrivateRoute(props: P) {
    const navigate = useNavigate();
    const { authenticated, loading, connectedToUsos } = useAuthContext();

    useEffect(() => {
      if (loading) return;
      if (!authenticated) {
        navigate(login);
      } else if (!connectedToUsos) {
        navigate(usosConnect);
      }
    }, [authenticated, loading, connectedToUsos, navigate]);

    if (loading || !authenticated || !connectedToUsos) {
      return <Loading />;
    }
    return <WrappedComponent {...props} />;
  };
}
