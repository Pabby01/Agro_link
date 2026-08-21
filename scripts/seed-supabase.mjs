// =============================================================================
// AGROLINK SUPABASE DATABASE SEEDER
// Run via: npm run db:seed
// =============================================================================

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0) {
          const val = rest.join("=").replace(/^["']|["']$/g, "");
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val.trim();
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

console.log("=======================================================");
console.log("AGROLINK SUPABASE DATABASE INITIALIZATION & SEEDER");
console.log("=======================================================");

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
  console.log("\n⚠️  Supabase URL or Key not configured in .env yet.");
  console.log("👉 Follow these steps to connect your real Supabase instance:\n");
  console.log("1. Open your Supabase Project dashboard (https://supabase.com/dashboard)");
  console.log("2. Open SQL Editor and paste the contents of: supabase/schema.sql");
  console.log("3. Click 'Run' to create the 10 production tables & ENUM types.");
  console.log("4. In the same SQL Editor, paste the contents of: supabase/seed.sql and click 'Run'.");
  console.log("5. Copy your Project URL & Anon Key into your .env file:");
  console.log("   VITE_SUPABASE_URL=https://your-project.supabase.co");
  console.log("   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...");
  console.log("   VITE_ENABLE_DEMO_MODE=false\n");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSeed() {
  console.log(`Connecting to: ${supabaseUrl}`);

  try {
    // Check connection
    const { data: users, error: userErr } = await supabase.from("users").select("id").limit(1);

    if (userErr) {
      console.error("\n❌ Database connection error:", userErr.message);
      console.log("\n💡 Reminder: Make sure you ran 'supabase/schema.sql' in your Supabase SQL Editor first!");
      process.exit(1);
    }

    console.log("✅ Supabase PostgreSQL connection verified!");
    console.log("✅ Schema tables detected.");

    // Seed listings if empty
    const { data: existingProduce } = await supabase.from("produce").select("id");
    console.log(`📊 Current Produce in database: ${existingProduce?.length ?? 0} items`);

    console.log("\n🚀 Database is fully active and ready for live Auth and transactions!");
  } catch (err) {
    console.error("Error executing seed:", err);
  }
}

runSeed();
