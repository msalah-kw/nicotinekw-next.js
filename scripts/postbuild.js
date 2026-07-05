const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (!fs.existsSync(standaloneDir)) {
  console.error('Standalone directory not found at:', standaloneDir);
  console.error('Please run "next build" first.');
  process.exit(1);
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  if (fs.existsSync(src)) {
    console.log(`Copying ${src} to ${dest}...`);
    fs.cpSync(src, dest, { recursive: true, force: true });
    console.log(`Successfully copied ${src}`);
  } else {
    console.log(`Source directory ${src} does not exist, skipping.`);
  }
}

// Copy public folder to .next/standalone/public
copyDir(path.join(rootDir, 'public'), path.join(standaloneDir, 'public'));

// Copy .next/static to .next/standalone/.next/static
copyDir(path.join(rootDir, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

console.log('Post-build asset copy completed successfully!');
