/**
 * Setup Supabase Storage buckets for TurniSmart.
 * Run: npx dotenv -e .env.local -- tsx scripts/setup-storage.ts
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function ensureBucket(name: string, options: { public?: boolean } = {}) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === name);

  if (exists) {
    console.log(`Bucket "${name}" already exists`);
    return;
  }

  const { data, error } = await supabase.storage.createBucket(name, {
    public: options.public ?? false,
  });

  if (error) {
    console.error(`Failed to create bucket "${name}":`, error.message);
    process.exit(1);
  }

  console.log(`Created bucket "${name}"`);
}

async function main() {
  console.log("Setting up Supabase Storage buckets...\n");

  await ensureBucket("reports", { public: true });
  await ensureBucket("imports", { public: false });
  await ensureBucket("avatars", { public: true });

  console.log("\nDone.");
}

main();
