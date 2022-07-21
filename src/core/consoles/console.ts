import { BootstrapConsole } from 'nestjs-console';
import { ConsoleContextModule } from './console-context.module';

const bootstrap = new BootstrapConsole({
  module: ConsoleContextModule,
  useDecorators: true,
});
void bootstrap.init().then(async (app) => {
  try {
    await app.init();
    await bootstrap.boot();
    await app.close();
  } catch (e) {
    console.error(e);
    await app.close();
    process.exit(1);
  }
});
