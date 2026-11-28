import { readFileSync } from 'fs';

describe('notification', () => {
  it('emits match events and does not run a house-betting command', () => {
    const gateway = readFileSync(
      'src/shared/infrastructure/socket/socket.gateway.ts',
      'utf8',
    );
    const consumer = readFileSync(
      'src/shared/infrastructure/socket/socket.consumer.ts',
      'utf8',
    );
    const source = gateway + consumer;

    expect(source).toMatch(/BettingOpened/);
    expect(source).toMatch(/FightRevealed/);
    expect(source).toMatch(/RewardsPaid/);
    expect(source).not.toMatch(
      /CommandBus|OpenHouseMatch|RevealHouseMatch|SettleHouseMatch/,
    );
  });
});
