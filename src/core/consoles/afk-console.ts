import { Command, Console } from 'nestjs-console';
import { Hero } from '../../app/hero/interfaces/hero.interface';
import { War } from '../../app/war/war';

@Console()
export class AfkConsole {
  @Command({ command: 'war' })
  async war() {
    const a = new Hero();
    const b = new Hero();
    const w = new War(a, b);
    await w.execute();
  }
}
