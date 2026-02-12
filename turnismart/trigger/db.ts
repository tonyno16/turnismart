import { drizzle } from "drizzle-orm/postgres-js";
import pg from "postgres";
import * as schema from "../drizzle/schema";

export function getDb() {
  const connectionString = process.env.DATABASE_URL!;
  const client = pg(connectionString, { max: 1 });
  return drizzle(client, { schema });
}
