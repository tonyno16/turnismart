/**
 * Carica .env.local e e2e/.env.test prima di script che usano DB/env.
 * Importare come prima riga negli script per evitare dotenv-cli (utile su Windows).
 */
import path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), "e2e/.env.test") });
