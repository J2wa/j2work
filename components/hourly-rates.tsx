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

function formatRate(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function RoleHourlyRates({
  job: { hourlyRatePhpCents: php, hourlyRateUsdCents: usd },
}: Parameters<typeof HourlyRates>[0]) {
  const phpRate = php === null ? null : `₱${formatRate(php)}/hr`;
  const usdRate = usd === null ? null : `$${formatRate(usd)}/hr`;
  return (
    <div className="role-pay">
      {phpRate || usdRate ? (
        <>
          <strong>{phpRate ?? usdRate}</strong>
          {phpRate && usdRate && <span>{usdRate}</span>}
        </>
      ) : (
        <span>Rate not listed</span>
      )}
    </div>
  );
}
