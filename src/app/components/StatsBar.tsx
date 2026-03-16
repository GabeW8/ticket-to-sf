export default function StatsBar({
  showing,
  total,
  totalCompanies,
}: {
  showing: number;
  total: number;
  totalCompanies: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm text-(--color-text-muted)">
      <span>
        Showing <span className="font-semibold text-(--color-text)">{showing}</span> of{" "}
        <span className="font-semibold text-(--color-text)">{total}</span> jobs from{" "}
        <span className="font-semibold text-(--color-text)">{totalCompanies}</span> companies
      </span>
    </div>
  );
}
