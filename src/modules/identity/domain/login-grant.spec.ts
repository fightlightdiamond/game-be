import { calendarDay, shouldGrant } from './login-grant';

describe('login grant', () => {
  it('changes the calendar day at midnight in Ho Chi Minh', () => {
    expect(calendarDay(new Date('2026-11-28T16:59:00.000Z'))).toBe(
      '2026-11-28',
    );
    expect(calendarDay(new Date('2026-11-28T17:00:00.000Z'))).toBe(
      '2026-11-29',
    );
  });

  it('grants only when that calendar day has not been granted', () => {
    expect(shouldGrant(null, '2026-11-28')).toBe(true);
    expect(shouldGrant('2026-11-27', '2026-11-28')).toBe(true);
    expect(shouldGrant('2026-11-28', '2026-11-28')).toBe(false);
  });
});
