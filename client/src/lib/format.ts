export function ngweeToZmw(amountNgwee: number): string {
  return new Intl.NumberFormat('en-ZM', {
    style: 'currency',
    currency: 'ZMW',
    minimumFractionDigits: 2
  }).format(amountNgwee / 100);
}

export function zmwToNgwee(value: string): number {
  const normalized = value.trim().replace(/,/g, '');
  if (!normalized) {
    return 0;
  }
  return Math.round(Number(normalized) * 100);
}

export function monthToday(): string {
  return new Date().toISOString().slice(0, 7);
}

export function dateToday(): string {
  return new Date().toISOString().slice(0, 10);
}
