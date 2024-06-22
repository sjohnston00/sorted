export function getRelativeTime(targetDate: Date | string | number) {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;

  const timeUnits = [
    { unit: "year", millis: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", millis: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", millis: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", millis: 1000 * 60 * 60 * 24 },
    { unit: "hour", millis: 1000 * 60 * 60 },
    { unit: "minute", millis: 1000 * 60 },
    { unit: "second", millis: 1000 },
  ];

  for (const { unit, millis } of timeUnits) {
    const diff = Math.round(diffTime / millis);
    if (Math.abs(diff) >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      return rtf.format(diff, unit);
    }
  }

  return "just now"; // Handle cases where the difference is less than 1 second
}
