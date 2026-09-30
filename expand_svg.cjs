const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/WastePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Change viewBox and width for ground and kerb
content = content.replace(
  'viewBox="0 0 700 230"',
  'viewBox="0 0 900 230"'
);

// We need to change the ground rect width from 700 to 900
content = content.replace(
  '<rect x="0" y="185" width="700" height="45" fill="url(#wj-gnd)" rx="0" opacity="0.55"/>',
  '<rect x="0" y="185" width="900" height="45" fill="url(#wj-gnd)" rx="0" opacity="0.55"/>'
);

// We need to change kerb line width from 700 to 900
content = content.replace(
  '<line x1="0" y1="186" x2="700" y2="186" stroke="#86efac" strokeWidth="1.5" opacity="0.6"/>',
  '<line x1="0" y1="186" x2="900" y2="186" stroke="#86efac" strokeWidth="1.5" opacity="0.6"/>'
);

// Add a few more road dashes for the extended road
content = content.replace(
  '{[50,115,180,245,310,375,440,505,570,635].map(x => (',
  '{[50,115,180,245,310,375,440,505,570,635,700,765,830].map(x => ('
);

// Adjust truck constants
content = content.replace(
  'const TRUCK_START_X = 110;',
  'const TRUCK_START_X = 110;'
);
content = content.replace(
  'const TRUCK_END_X   = 332;',
  'const TRUCK_END_X   = 512;'
);

// Adjust translations for groups
content = content.replace(
  '<g transform="translate(-30, 0)">',
  '<g transform="translate(-30, 0)">'
);

// The plant was previously translated by 30. We now want to translate by 210.
content = content.replace(
  '<g transform="translate(30, 0)">',
  '<g transform="translate(210, 0)">'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done expanding viewBox');
