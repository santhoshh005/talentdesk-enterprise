import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, '../dist/client');
const distDir = path.join(__dirname, '../dist');

if (fs.existsSync(clientDir)) {
  console.log('Copying dist/client files to dist root for Vercel deployment compatibility...');
  fs.cpSync(clientDir, distDir, { recursive: true });
  console.log('Postbuild copy complete.');
}
