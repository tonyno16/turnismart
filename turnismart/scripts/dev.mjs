#!/usr/bin/env node
/**
 * Dev launcher - ensures cwd and NODE_PATH are set to turnismart
 * so module resolution (PostCSS/Tailwind, etc.) works correctly
 * when workspace root is the parent "Gestioni Orari" folder.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

process.chdir(projectRoot);
process.env.NODE_PATH = path.join(projectRoot, "node_modules");

const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const next = spawn(process.execPath, [nextBin, "dev"], {
  stdio: "inherit",
  env: { ...process.env, NODE_PATH: process.env.NODE_PATH },
  cwd: projectRoot,
});

next.on("exit", (code) => process.exit(code ?? 0));
