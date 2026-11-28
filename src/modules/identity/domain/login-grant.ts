export const GRANT_AMOUNT = 100;
export const GRANT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function calendarDay(now: Date, timeZone = GRANT_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function shouldGrant(grantedOn: string | null, today: string): boolean {
  return grantedOn !== today;
}
