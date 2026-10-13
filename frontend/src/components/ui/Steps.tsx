import "./ui.scss";

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  return (
    <ol className="steps" aria-label="Kroki">
      {labels.map((label, i) => (
        <li key={label} className={`steps-item ${i <= current ? "reached" : ""}`} aria-current={i === current ? "step" : undefined}>
          <span className={`steps-circle ${i < current ? "done" : i === current ? "current" : ""}`}>
            {i < current ? "✓" : i + 1}
          </span>
          {label}
          {i < labels.length - 1 && <span className={`steps-line ${i < current ? "done" : ""}`} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}
