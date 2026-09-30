const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/WastePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace both instances of the container class
content = content.replace(
  'className="relative z-10 max-w-6xl mx-auto px-6 py-8"',
  'className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6"'
);

content = content.replace(
  'className="relative z-10 max-w-5xl mx-auto px-6 py-8"',
  'className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('WastePage updated');
