import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import { useNavigate } from "react-router-dom";
import "./UserPage.scss";
import { useAuthContext } from "../../providers/authContext";

const UserPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  return (
    <>
      <div className="userContainer">
        <div className="avatar">
          <img
            src={
              currentUser?.avatar
                ? `/avatars/${currentUser.avatar}.png`
                : "/avatars/man.png"
            }
            alt="Avatar"
          />
        </div>
        <div className="userData">
          <b>Nazwa użytkownika:</b>{" "}
          <input
            type="text"
            name="userLogin"
            id="userLogin"
            placeholder={currentUser?.username ?? "Connection error"}
            disabled
          />
          <br />
        </div>
      </div>
      <button className="changeButton" onClick={() => navigate("/modifyUser")}>
        Zmień dane
      </button>
    </>
  );
};

export const PrivateUserPage = withPrivateRoute(UserPage);
