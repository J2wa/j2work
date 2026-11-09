export function HourlyRates({
  job,
}: {
  job: { hourlyRatePhpCents: number | null; hourlyRateUsdCents: number | null };
}) {
  const rates = [
    ["PHP", job.hourlyRatePhpCents],
    ["USD", job.hourlyRateUsdCents],
  ] as const;
  const available = rates.filter(([, value]) => value !== null);
  if (!available.length) return null;
  return (
    <p className="text-sm font-semibold text-accent">
      {available
        .map(
          ([currency, value]) =>
            `${currency} ${((value ?? 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/hr`,
        )
        .join(" · ")}
    </p>
  );
}
