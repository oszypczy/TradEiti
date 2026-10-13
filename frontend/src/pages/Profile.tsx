import { useNavigate } from "react-router-dom";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { useAuthContext } from "../providers/authContext";
import { avatarSrc } from "../utils/avatars";
import "./profile.scss";

function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  return (
    <div className="page profile">
      <h1 className="page-title">Mój profil</h1>
      <div className="card profile-card">
        <img src={avatarSrc(currentUser?.avatar)} alt="Avatar" />
        <div className="who">
          <span className="eyebrow">Nazwa użytkownika</span>
          <span className="name">{currentUser?.username}</span>
          <span className="pill green">Połączono z USOS</span>
        </div>
        <button type="button" className="btn secondary" onClick={() => navigate("/modifyUser")}>
          Zmień dane
        </button>
      </div>
    </div>
  );
}

export const Profile = withPrivateRoute(ProfilePage);
