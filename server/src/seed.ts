import mongoose from 'mongoose';
import { MongoStore } from './store.ts';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Set MONGODB_URI to seed a database.');
  process.exit(1);
}

await mongoose.connect(uri);
await MongoStore.seed();
console.log('Seeded events, trails, campsites and rigs.');
await mongoose.disconnect();
