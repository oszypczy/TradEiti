import { GroupView } from "../../utils/groupView";
import "./ui.scss";

interface Props {
  label?: string;
  group: GroupView;
  tone: "give" | "want";
}

// One class meeting: day badge, time, weekday + group number, lecturers.
export function Slot({ label, group, tone }: Props) {
  return (
    <div className="slot">
      {label && <span className="eyebrow">{label}</span>}
      <SlotBody group={group} tone={tone} />
    </div>
  );
}

export function SlotBody({ group, tone }: Omit<Props, "label">) {
  return (
    <div className="slot-body">
      <div className={`day ${tone}`}>{group.dayShort}</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="slot-time">{group.time}</div>
        <div className="slot-meta">
          {group.dayLong} · gr. {group.num}
        </div>
        {group.lecturers && <div className="slot-lecturers">{group.lecturers}</div>}
      </div>
    </div>
  );
}

export function Exchange({
  give,
  want,
  giveLabel,
  wantLabel,
}: {
  give: GroupView;
  want: GroupView;
  giveLabel: string;
  wantLabel: string;
}) {
  return (
    <div className="exchange">
      <Slot label={giveLabel} group={give} tone="give" />
      <div className="exchange-arrow" aria-hidden>
        →
      </div>
      <Slot label={wantLabel} group={want} tone="want" />
    </div>
  );
}
