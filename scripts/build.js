import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const rootDist = path.join(rootDir, 'dist');
const clientDist = path.join(clientDir, 'dist');

console.log('[InGPT Build] Preparing frontend build...');

// 1. Ensure client dependencies are installed
if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
  console.log('[InGPT Build] Installing client dependencies...');
  execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
}

// 2. Run Vite build
console.log('[InGPT Build] Running Vite build...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

// 3. Guarantee that BOTH root ./dist and ./client/dist exist with index.html
if (fs.existsSync(rootDist) && !fs.existsSync(clientDist)) {
  fs.mkdirSync(clientDist, { recursive: true });
  fs.cpSync(rootDist, clientDist, { recursive: true });
} else if (fs.existsSync(clientDist) && !fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
  fs.cpSync(clientDist, rootDist, { recursive: true });
}

// 4. Verify dist folder has index.html
if (fs.existsSync(path.join(rootDist, 'index.html'))) {
  console.log('[InGPT Build] Verified root dist/index.html exists successfully.');
} else {
  console.error('[InGPT Build] Warning: dist/index.html was not found!');
}

console.log('[InGPT Build] Build completed cleanly!');
