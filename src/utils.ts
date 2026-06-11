export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTimeExact(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = minutes < 0 ? '-' : '';

  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hr${h === 1 ? '' : 's'}`);
  if (m > 0 || h === 0) parts.push(`${m} min${m === 1 ? '' : 's'}`);

  return `${sign}${parts.join(' ')}`;
}
