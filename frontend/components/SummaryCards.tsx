interface SummaryCardsProps {
  totalRows: number;
  imported: number;
  skipped: number;
}

export default function SummaryCards({ totalRows, imported, skipped }: SummaryCardsProps) {
  const cards = [
    { label: "Total Rows", value: totalRows, color: "text-navy" },
    { label: "Imported", value: imported, color: "text-teal-600" },
    { label: "Skipped", value: skipped, color: "text-orange-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-border rounded-xl p-5 flex flex-col gap-1"
        >
          <span className="text-sm text-muted">{card.label}</span>
          <span className={`text-3xl font-semibold ${card.color}`}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}