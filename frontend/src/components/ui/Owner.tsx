import { avatarColors } from "../../utils/groupView";
import "./ui.scss";

export function Owner({ username, label }: { username: string; label?: string }) {
  const [bg, ink] = avatarColors(username);
  return (
    <div className="owner">
      <span className="owner-initial" style={{ background: bg, color: ink }}>
        {username[0]?.toUpperCase()}
      </span>
      {label ?? username}
    </div>
  );
}
