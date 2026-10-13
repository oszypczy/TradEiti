import { ReactNode } from "react";
import "./ui.scss";

interface Props {
  courseName: string;
  courseId: string;
  classType: string;
  aside?: ReactNode;
  stub: ReactNode;
  tone?: "neutral" | "blue" | "green";
  wideStub?: boolean;
  children: ReactNode;
}

// Offer card styled as a ticket: details on the left, perforated "stub" with actions on the right.
export function Ticket({ courseName, courseId, classType, aside, stub, tone = "neutral", wideStub, children }: Props) {
  return (
    <article className={`ticket tone-${tone} ${wideStub ? "wide-stub" : ""}`}>
      <div className="ticket-main">
        <div className="ticket-head">
          <div className="ticket-title">
            <div>
              <span className="card-title">{courseName}</span>
              <span className="tag">{classType}</span>
            </div>
            <span className="course-code">{courseId}</span>
          </div>
          {aside}
        </div>
        {children}
      </div>
      <div className="ticket-stub">{stub}</div>
    </article>
  );
}
