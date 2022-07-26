import { Command, Console } from 'nestjs-console';
import { Hero } from '../../app/hero/interfaces/hero.interface';
import { MatchService } from '../../app/match/match.service';

@Console()
export class AfkConsole {
  @Command({ command: 'war' })
  async war() {
    const a = new Hero();
    const b = new Hero();
    const w = new MatchService(a, b);
    await w.execute();
  }
}
