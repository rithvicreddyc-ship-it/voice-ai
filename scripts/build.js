import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const clientDist = path.join(clientDir, 'dist');
const rootDist = path.join(rootDir, 'dist');

console.log('[InGPT Build] Preparing frontend build...');

// 1. Ensure client dependencies are installed
if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
  console.log('[InGPT Build] Installing client dependencies...');
  execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
}

// 2. Run Vite build in client directory
console.log('[InGPT Build] Running Vite build...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

// 3. Mirror client/dist to root ./dist for Vercel/Express compatibility
if (fs.existsSync(clientDist)) {
  if (!fs.existsSync(rootDist)) {
    fs.mkdirSync(rootDist, { recursive: true });
  }
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('[InGPT Build] Copied client/dist to root dist directory.');
}

console.log('[InGPT Build] Build succeeded cleanly!');
