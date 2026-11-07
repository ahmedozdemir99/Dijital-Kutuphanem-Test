export function readingDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function quranPagesToday(progress: { readingCalendar?: Record<string, number> }): number {
  return progress.readingCalendar?.[readingDate()] || 0;
}
