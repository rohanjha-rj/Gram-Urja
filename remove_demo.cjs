const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace Demo phrases
  content = content.replace(/· Demo Mode/g, '');
  content = content.replace(/⚡ Demo Mode/g, '');
  content = content.replace(/Demo Mode ·/g, '');
  content = content.replace(/Demo Mode/g, '');
  content = content.replace(/· Demo Household/g, '');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walk('./src');
console.log('Removed Demo references from text.');
