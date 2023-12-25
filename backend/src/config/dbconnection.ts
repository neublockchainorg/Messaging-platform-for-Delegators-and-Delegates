import 'dotenv/config';
import mongodb, { MongoClient } from 'mongodb';

const url = process.env.DATABASE_URL || 'mongodb://localhost:27017';

console.log('Mongourl', url);

const mongoClient = new MongoClient(url);

const dbName = 'daodb';

let db: mongodb.Db;

export async function connectDb() {
  await mongoClient.connect();
  console.log('Connected successfully to server');
  db = mongoClient.db(dbName);
}

export function getDb() {
  if (!db) {
    throw new Error('Db not initialized');
  }
  return db;
}
