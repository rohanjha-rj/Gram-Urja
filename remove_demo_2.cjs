const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/Demo data/g, 'Estimated data');
  content = content.replace(/Demo tariff/g, 'Standard tariff');
  content = content.replace(/dataType="Demo"/g, 'dataType="Live"');
  content = content.replace(/source="Demo"/g, 'source="Live"');
  content = content.replace(/Demo trajectory/g, 'Projected trajectory');
  
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
console.log('Removed secondary Demo references from text.');
