import { droppedType } from '../domain/gem';
import { GemRepository } from '../domain/repositories/gem.repository';
import { Roll } from '../domain/roll';

export async function dropFor(
  accountIds: number[],
  roll: Roll,
  gems: Pick<GemRepository, 'addLevelOne'>,
): Promise<void> {
  for (const accountId of accountIds) {
    const type = droppedType(roll.between(1, 100), roll.between(0, 5));
    if (!type) {
      continue;
    }
    await gems.addLevelOne(accountId, type);
  }
}
