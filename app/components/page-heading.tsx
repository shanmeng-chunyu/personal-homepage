type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  count?: number;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  count,
}: PageHeadingProps) {
  return (
    <header className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {typeof count === "number" ? (
        <span className="count-pill">{String(count).padStart(2, "0")}</span>
      ) : null}
    </header>
  );
}
