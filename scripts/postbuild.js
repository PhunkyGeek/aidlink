// scripts/postbuild.js

const fs = require('fs');
const path = '.next/export-detail.json';

if (fs.existsSync(path)) {
  try {
    const content = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(content);
    console.log('Parsed export-detail.json:', json);
    // You can do something with the JSON here if needed
  } catch (err) {
    console.error('Invalid JSON in export-detail.json:', err.message);
  }
} else {
  console.log('No export-detail.json found. Skipping.');
}
