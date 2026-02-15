import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadLocalEnvFiles() {
  const envFiles = [".env", ".env.local"];

  for (const file of envFiles) {
    const fullPath = join(process.cwd(), file);

    if (!existsSync(fullPath)) {
      continue;
    }

    const content = readFileSync(fullPath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmed.indexOf("=");

      if (equalsIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = value;
      }
    }
  }
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

loadLocalEnvFiles();

const requiredKeys = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
];

const errors = [];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    errors.push(`${key}: is required`);
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  if (!isValidUrl(databaseUrl)) {
    errors.push("DATABASE_URL: must be a valid URL");
  } else if (
    !databaseUrl.startsWith("postgres://") &&
    !databaseUrl.startsWith("postgresql://")
  ) {
    errors.push("DATABASE_URL: must start with postgres:// or postgresql://");
  }
}

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (betterAuthSecret && betterAuthSecret.length < 32) {
  errors.push("BETTER_AUTH_SECRET: must be at least 32 characters");
}

for (const key of ["BETTER_AUTH_URL", "NEXT_PUBLIC_APP_URL"]) {
  const value = process.env[key];
  if (value && !isValidUrl(value)) {
    errors.push(`${key}: must be a valid URL`);
  }
}

if (errors.length > 0) {
  console.error("[startup] Environment validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("[startup] Environment validation passed.");
