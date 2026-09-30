const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/WastePage.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replaceAll(
  'viewBox="0 0 700 230"',
  'viewBox="0 0 900 230"'
);

content = content.replaceAll(
  '<rect x="0" y="185" width="700" height="45" fill="url(#wj-gnd)" rx="0" opacity="0.55"/>',
  '<rect x="0" y="185" width="900" height="45" fill="url(#wj-gnd)" rx="0" opacity="0.55"/>'
);

content = content.replaceAll(
  '<line x1="0" y1="186" x2="700" y2="186" stroke="#86efac" strokeWidth="1.5" opacity="0.6"/>',
  '<line x1="0" y1="186" x2="900" y2="186" stroke="#86efac" strokeWidth="1.5" opacity="0.6"/>'
);

content = content.replaceAll(
  '{[50,115,180,245,310,375,440,505,570,635].map(x => (',
  '{[50,115,180,245,310,375,440,505,570,635,700,765,830].map(x => ('
);

// We already changed TRUCK_START_X and TRUCK_END_X for the village view, but wait, those were defined globally?
// Let's check if they were globally defined. Yes, "const TRUCK_START_X = 110;" was outside the components.
// We just need to apply the group translations to the HouseholdWasteView as well.
// Wait, the first one was already replaced by the previous script. Let's make sure we only replace the un-translated ones.

// For the left side
const oldLeftTarget = '{/* ══════ LEFT — WASTE PILE ══════ */}';
const newLeftTarget = '{/* ══════ LEFT — WASTE PILE ══════ */}\\n          <g transform="translate(-30, 0)">';

// For the truck
const oldTruckTarget = '{/* ══════ TRUCK ══════';
const newTruckTarget = '</g>\\n          {/* ══════ TRUCK ══════';

// For the right side
const oldRightTarget = '{/* ══════ RIGHT — BIOGAS PLANT ══════ */}';
const newRightTarget = '{/* ══════ RIGHT — BIOGAS PLANT ══════ */}\\n          <g transform="translate(210, 0)">';

// Only replace if they aren't already replaced
let parts = content.split('HouseholdWasteView()');
if (parts.length === 2) {
  let hhContent = parts[1];
  
  if (hhContent.includes(oldLeftTarget)) {
    hhContent = hhContent.replace('{/* ══════ LEFT — WASTE PILE ══════ */}', '{/* ══════ LEFT — WASTE PILE ══════ */}\\n          <g transform="translate(-30, 0)">');
    hhContent = hhContent.replace('{/* ══════ TRUCK ══════', '</g>\\n          {/* ══════ TRUCK ══════');
    hhContent = hhContent.replace('{/* ══════ RIGHT — BIOGAS PLANT ══════ */}', '{/* ══════ RIGHT — BIOGAS PLANT ══════ */}\\n          <g transform="translate(210, 0)">');
    
    // We also need to add </g> right before the </svg> in the household view
    hhContent = hhContent.replace(
      '<path d="M 152 183 C 280 175, 360 175, 488 183"\\n            fill="none" stroke="#16a34a" strokeWidth="1.8"\\n            strokeDasharray="7 5" opacity="0.35"/>\\n\\n        </svg>',
      '<path d="M 152 183 C 280 175, 360 175, 488 183"\\n            fill="none" stroke="#16a34a" strokeWidth="1.8"\\n            strokeDasharray="7 5" opacity="0.35"/>\\n          </g>\\n\\n        </svg>'
    );
  }
  
  content = parts[0] + 'HouseholdWasteView()' + hhContent;
}

// Write file
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed SVG tags and expanded Household view');
