const fs = require("fs");
const path = require("path");

const resolveEnvPath = () => {
  const envFlagIndex = process.argv.findIndex((arg) => arg === "--env");
  const envFlagValue = envFlagIndex !== -1 ? process.argv[envFlagIndex + 1] : null;
  const envFile = envFlagValue || process.env.ENV_FILE || ".env.local";
  return path.isAbsolute(envFile) ? envFile : path.resolve(__dirname, "..", envFile);
};

const parseEnvFile = (filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const env = {};
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!key) return;
    env[key] = value;
  });
  return env;
};

const loadEnv = () => {
  const envPath = resolveEnvPath();
  if (!fs.existsSync(envPath)) {
    throw new Error(`Env file not found: ${envPath}`);
  }
  return { env: parseEnvFile(envPath), envPath };
};

module.exports = { loadEnv };
