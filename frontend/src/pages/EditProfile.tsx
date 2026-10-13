import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changeUserAvatar, changeUserLogin } from "../apiFunctions/changeUserData";
import { saveToken } from "../auth/JwtToken";
import { withPrivateRoute } from "../common/withPrivateRoute/WithPrivateRoute";
import { useAuthContext } from "../providers/authContext";
import { useToast } from "../components/ui/toastContext";
import { AVATAR_LABELS, AVATARS, avatarSrc } from "../utils/avatars";
import { statusOf } from "../utils/apiError";
import "./profile.scss";

function EditProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, refresh } = useAuthContext();
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? "helicopter");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const newName = username.trim();
    setSaving(true);
    setError("");
    try {
      if (avatar !== currentUser?.avatar) await changeUserAvatar(avatar);
      if (newName && newName !== currentUser?.username) {
        const { token } = await changeUserLogin(newName);
        saveToken(token);
      }
      refresh();
      toast.show("Dane zmienione.");
      navigate("/userPage");
    } catch (err) {
      setError(statusOf(err) === 409 ? "Ta nazwa użytkownika jest już zajęta." : "Nie udało się zapisać zmian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page profile">
      <div className="back-head">
        <button type="button" className="link" onClick={() => navigate("/userPage")}>
          ← Mój profil
        </button>
        <h1 className="page-title">Zmień dane</h1>
      </div>
      <div className="card profile-form">
        <div className="stack" style={{ gap: 10 }}>
          <span style={{ font: "700 13px var(--font-body)" }}>Avatar</span>
          <div className="avatars" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((name) => (
              <button key={name} type="button" role="radio" aria-checked={avatar === name} onClick={() => setAvatar(name)}>
                <img src={avatarSrc(name)} alt={AVATAR_LABELS[name]} />
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          Nowa nazwa użytkownika
          <input
            id="userLogin"
            className="input"
            placeholder={`Obecna nazwa: ${currentUser?.username ?? ""}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="actions">
          <button type="button" className="btn secondary" onClick={() => navigate("/userPage")}>
            Anuluj
          </button>
          <button type="button" className="btn primary" disabled={saving} onClick={save}>
            Zapisz dane
          </button>
        </div>
      </div>
    </div>
  );
}

export const EditProfile = withPrivateRoute(EditProfilePage);
