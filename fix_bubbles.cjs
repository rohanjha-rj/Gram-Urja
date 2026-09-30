const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/WastePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace bubble positions
content = content.replace(
  /const bPos = \[\s*\{ x: 450, y: 72, r: 38 \},\s*\{ x: 516, y: 44, r: 38 \},\s*\{ x: 586, y: 44, r: 38 \},\s*\{ x: 650, y: 72, r: 38 \},\s*\];/g,
  `const bPos = [
    { x: 430, y: 72, r: 38 },
    { x: 512, y: 44, r: 38 },
    { x: 596, y: 44, r: 38 },
    { x: 678, y: 72, r: 38 },
  ];`
);

// Remove the dashed guide path in all occurrences
// Since there could be slight whitespace differences, I'll use a regex that matches the whole comment and the path
const dashPathRegex = /\{\/\*\s*══════ DASHED GUIDE PATH ══════\s*\*\/}[\s\S]*?<path d="M 152 183 C 280 175, 360 175, 488 183"[\s\S]*?strokeDasharray="7 5" opacity="0\.35"\/>/g;

content = content.replace(dashPathRegex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed bubbles and removed line');
