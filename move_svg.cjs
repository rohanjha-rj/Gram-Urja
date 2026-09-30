const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/WastePage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update truck constants
content = content.replace(
  'const TRUCK_START_X = 140;',
  'const TRUCK_START_X = 110;'
);
content = content.replace(
  'const TRUCK_END_X   = 302;',
  'const TRUCK_END_X   = 332;'
);

// Wrap waste pile in <g>
content = content.replace(
  '{/* ══════ LEFT — WASTE PILE ══════ */}',
  '{/* ══════ LEFT — WASTE PILE ══════ */}\n          <g transform="translate(-30, 0)">'
);

content = content.replace(
  '{/* ══════ TRUCK ══════',
  '</g>\n          {/* ══════ TRUCK ══════'
);

// Wrap biogas plant in <g>
content = content.replace(
  '{/* ══════ RIGHT — BIOGAS PLANT ══════ */}',
  '{/* ══════ RIGHT — BIOGAS PLANT ══════ */}\n          <g transform="translate(30, 0)">'
);

// Bubbles are at the end of the SVG. Let's find where the SVG ends.
// In the SVG, there is </svg>. The plant includes the bubbles.
// Let's replace </svg> with </g>\n        </svg> (but only the first match or carefully)
content = content.replace(
  '</svg>',
  '</g>\n        </svg>'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done moving SVG elements');
