export const GRANTED_DAY = Symbol('GRANTED_DAY');

export interface GrantedDay {
  claim(accountId: number, day: string): Promise<boolean>;
  release(accountId: number, day: string): Promise<void>;
}
