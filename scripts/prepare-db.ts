// A new dedicated database is migrated on deployment; absent credentials never
// fall back to ephemeral filesystem storage in production.
if (process.env.TURSO_DATABASE_URL) {
  const { migrate } = await import("drizzle-orm/libsql/migrator");
  const { db } = await import("../lib/db");
  await migrate(db(), { migrationsFolder: "./drizzle" });
  console.log("Database migrations applied.");
} else {
  console.log(
    "Turso is not connected yet. Publishing the public pages with registration paused.",
  );
}

export {};
