import { Navigate, useNavigate } from "react-router-dom";
import { connectUsos } from "../../apiFunctions/connectUsos";
import { useAuthContext } from "../../providers/authContext";
import "./UsosConnect.scss";

export function UsosConnect() {
  const navigate = useNavigate();
  const { connectedToUsos, logout } = useAuthContext();

  if (connectedToUsos) {
    return <Navigate to="/" replace />;
  }

  const getToken = () => {
    connectUsos()
      .then((authorizationUrl) => {
        window.location.href = authorizationUrl;
      })
      .catch(() => {
        logout();
        navigate("/login?redirected=true");
      });
  };
  return (
    <div>
      <h1>Połącz z USOS</h1>
      <img src="/plug.png" alt="plug" width="200px" />
      <br />
      <button className="usosButton" onClick={getToken}>
        Połącz konto
      </button>
    </div>
  );
}
