import { createApp } from './app.ts';
import { createStore } from './store.ts';

const port = Number(process.env.PORT ?? 4000);
const store = await createStore();

createApp(store).listen(port, () => {
  console.log(`Sakalam API on http://localhost:${port} (${store.kind} store)`);
});
