import "./CourseDate.scss";
import { GroupDto } from "../../models/GroupDto";

interface CourseDateProps {
  date: GroupDto;
  hourType: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (date: GroupDto) => void;
}

export function CourseDateComponent({
  date,
  hourType,
  selected,
  disabled,
  onSelect,
}: CourseDateProps) {
  const handleSelect = () => {
    if (!disabled) onSelect(date);
  };

  return (
    <span
      className={`radioSpan ${hourType} ${disabled ? "unavailable" : ""}`}
      style={selected ? { borderRadius: "15px" } : undefined}
      onClick={handleSelect}
    >
      <div className="radioSpan-date">
        <input
          type="radio"
          name={`hours/${hourType}`}
          checked={selected}
          disabled={disabled}
          onChange={handleSelect}
          onClick={(event) => event.stopPropagation()}
        />{" "}
        <div className="courseTime">
          {date.weekday}{" "}
          <b>
            <br />
            {date.start_time} - {date.end_time}
          </b>
        </div>
      </div>
      <div className="lecturers">
        {date.lecturers?.map((lecturer, index) => (
          <span key={index}>{lecturer}</span>
        ))}
      </div>
    </span>
  );
}
