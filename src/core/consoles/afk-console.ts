import { Command, Console } from 'nestjs-console';
import { Hero, War } from '../../app/hero/interfaces/hero.interface';

@Console()
export class AfkConsole {
  @Command({ command: 'war' })
  async war() {
    const a = new Hero();
    const b = new Hero();
    const w = new War(a, b);
    await w.execute();
  }

  @Command({ command: 'g-hero' })
  async gHero() {
    const a = new Hero();
    // const h = new HeroesEntity();
  }
}
