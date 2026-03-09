import { openDb, initSchema, dbPath } from "./shared.mjs";

const db = openDb();
initSchema(db);
db.close();
console.log(`[vocab-db] initialized schema at ${dbPath}`);
