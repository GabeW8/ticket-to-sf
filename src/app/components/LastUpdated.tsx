export default function LastUpdated({ date }: { date: string }) {
  const d = new Date(date);
  const formatted = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <span className="text-xs text-(--color-text-muted)">
      Last updated: {formatted}
    </span>
  );
}
