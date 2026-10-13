import { useState } from "react";
import { withPrivateRoute } from "../../common/withPrivateRoute/WithPrivateRoute";
import "./ModifyUser.scss";
import {
  changeUserAvatar,
  changeUserLogin,
} from "../../apiFunctions/changeUserData";
import { saveToken } from "../../auth/JwtToken";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../providers/authContext";

const avatars = [
  { name: "man", path: "/avatars/man.png" },
  { name: "woman", path: "/avatars/woman.png" },
  { name: "helicopter", path: "/avatars/helicopter.png" },
];

const ModifyUser = () => {
  const navigate = useNavigate();
  const { currentUser, refresh } = useAuthContext();
  const [selectedAvatar, setSelectedAvatar] = useState(
    currentUser?.avatar ?? "helicopter"
  );
  const [newLogin, setNewLogin] = useState("");

  const handleChange = async () => {
    try {
      if (selectedAvatar !== currentUser?.avatar) {
        await changeUserAvatar(selectedAvatar);
      }
    } catch (error) {
      console.error(error);
      alert("Wystąpił błąd, dane nie zostały zmienione");
      return;
    }
    const login = newLogin.trim();
    if (login && login !== currentUser?.username) {
      try {
        const response = await changeUserLogin(login);
        saveToken(response.token);
      } catch (error) {
        console.error(error);
        alert("Wystąpił błąd. Nazwa użytkownika zajęta.");
        refresh();
        return;
      }
    }
    alert("Dane zmienione.");
    refresh();
    navigate("/userPage");
  };

  return (
    <>
      <div className="userContainer">
        <div className="avatar">
          {avatars.map((avatar) => (
            <div className="avatarRadio" key={avatar.name}>
              <input
                type="radio"
                name="avatar"
                value={avatar.name}
                checked={selectedAvatar === avatar.name}
                onChange={(e) => setSelectedAvatar(e.target.value)}
              />
              <img
                src={avatar.path}
                alt="Avatar"
                onClick={() => setSelectedAvatar(avatar.name)}
              />
            </div>
          ))}
        </div>
        <div className="userData">
          <b>Nowa nazwa użytkownika:</b>{" "}
          <input
            type="text"
            name="userLogin"
            id="userLogin"
            placeholder={"Obecna nazwa: " + (currentUser?.username ?? "")}
            value={newLogin}
            onChange={(e) => setNewLogin(e.target.value)}
          />
          <br />
        </div>
      </div>
      <button className="changeButton" onClick={handleChange}>
        Zapisz dane
      </button>
    </>
  );
};

export const PrivateModifyUser = withPrivateRoute(ModifyUser);
