import { defineConfig } from "drizzle-kit";

// Usa: npm run db:migrate (carica .env.local via dotenv-cli)
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error(
    "DATABASE_URL non trovata. Esegui: npm run db:migrate (carica .env.local)"
  );
}

export default defineConfig({
  schema: "./drizzle/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
