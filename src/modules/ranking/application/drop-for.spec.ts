import { Roll } from '../domain/roll';
import { dropFor } from './drop-for';

class SequenceRoll implements Roll {
  private index = 0;

  constructor(private readonly values: number[]) {}

  between(): number {
    const value = this.values[this.index];
    this.index += 1;
    return value;
  }
}

describe('dropFor', () => {
  it('adds one level-1 gem per winning account when the roll is at most 5', async () => {
    const added: Array<{ accountId: number; type: string }> = [];
    await dropFor([3, 8], new SequenceRoll([5, 1, 6, 0]), {
      addLevelOne: (accountId, type) => {
        added.push({ accountId, type });
        return Promise.resolve();
      },
    });

    expect(added).toEqual([{ accountId: 3, type: 'ATK' }]);
  });
});
