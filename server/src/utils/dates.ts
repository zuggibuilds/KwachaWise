export function nowIso(): string {
  return new Date().toISOString();
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoMonth(value: string): boolean {
  return /^\d{4}-\d{2}$/.test(value);
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonths(dateString: string, months: number): string {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  const day = date.getUTCDate();
  date.setUTCMonth(date.getUTCMonth() + months);
  if (date.getUTCDate() < day) {
    date.setUTCDate(0);
  }
  return date.toISOString().slice(0, 10);
}
