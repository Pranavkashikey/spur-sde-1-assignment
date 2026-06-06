import { runMigrations } from "./migrate";

async function seed(): Promise<void> {
  await runMigrations();
  console.log("✅ Seed complete.");
}

seed().then(() => process.exit(0)).catch(console.error);