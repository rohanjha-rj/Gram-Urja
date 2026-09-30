const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Section styling
content = content.replace(
  `className="relative flex flex-col pt-8 pb-12"`,
  `className="relative flex flex-col justify-center min-h-screen py-4"`
);

// Container gap
content = content.replace(
  `className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10"`,
  `className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-5"`
);

// Hero Image Card height
content = content.replace(
  `style={{ minHeight: '550px' }}>`,
  `style={{ minHeight: '420px' }}>`
);

// Hero Content padding
content = content.replace(
  `className="relative z-10 w-full h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-3xl"`,
  `className="relative z-10 w-full h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-center max-w-3xl"`
);

// Live Region badge margin
content = content.replace(
  `w-max mb-6"`,
  `w-max mb-4"`
);

// H1 size and margin
content = content.replace(
  `className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.1] text-white drop-shadow-lg mb-6 tracking-tight"`,
  `className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.1] text-white drop-shadow-lg mb-4 tracking-tight"`
);

// Subtitle margin
content = content.replace(
  `className="text-gray-200 text-lg leading-relaxed max-w-xl font-medium drop-shadow-md mb-8"`,
  `className="text-gray-200 text-base leading-relaxed max-w-xl font-medium drop-shadow-md mb-5"`
);

// Mission strip gap
content = content.replace(
  `className="grid lg:grid-cols-2 gap-8 items-start"`,
  `className="grid lg:grid-cols-2 gap-6 items-start"`
);

// Mission heading margin
content = content.replace(
  `className="text-2xl font-extrabold text-white leading-snug mb-3"`,
  `className="text-xl font-extrabold text-white leading-snug mb-2"`
);

// Mission text margin
content = content.replace(
  `className="text-gray-300 text-sm leading-relaxed mb-6"`,
  `className="text-gray-300 text-sm leading-relaxed mb-4"`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Done tightening layout');
