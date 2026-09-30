const fs = require('fs');
const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const heroBgRegex = /function HeroBackground\([\s\S]*?\}\);?\n\}/;
const newHeroBg = `function HeroBackground({ isHindi }: { isHindi: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 select-none overflow-hidden z-0">
      {HERO_PHOTOS.map((photo, i) => (
        <img key={photo.url} src={photo.url} alt={isHindi ? photo.labelHi : photo.labelEn} loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#02180b] via-[#02180b]/80 to-transparent" />
      
      <div className="absolute bottom-4 right-8 flex gap-2 z-20">
        {HERO_PHOTOS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={\`h-1.5 rounded-full transition-all duration-300 \${i === active ? 'bg-white w-5' : 'bg-white/50 w-1.5'}\`} />
        ))}
      </div>
    </div>
  );
}`;
content = content.replace(heroBgRegex, newHeroBg);


const sectionRegex = /<section\s+className="relative flex flex-col overflow-hidden"[\s\S]*?<\/section>/;

const newSection = `<section
        className="relative flex flex-col pt-8 pb-12"
        style={{
          background: 'linear-gradient(160deg,#030d07 0%,#052e16 25%,#14532d 55%,#0d2e1e 80%,#020a05 100%)',
        }}
      >
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\'%3E%3Cfilter id=\\'n\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'300\\' height=\\'300\\' filter=\\'url(%23n)\\' opacity=\\'1\\'/%3E%3C/svg%3E")', backgroundSize: '200px' }} />

        {/* Leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {[{ x: '8%', delay: '0s', size: 10 }, { x: '18%', delay: '2.3s', size: 8 }, { x: '75%', delay: '1.1s', size: 12 }, { x: '88%', delay: '3.5s', size: 9 }].map((p, i) => (
            <div key={i} className="absolute gu-leaf-fall" style={{ left: p.x, top: '-20px', animationDelay: p.delay, fontSize: p.size + 'px' }}>🌿</div>
          ))}
        </div>

        {/* ── Inner container ── */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
          
          {/* ── HERO IMAGE CARD ── */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ minHeight: '550px' }}>
            
            <HeroBackground isHindi={isHindi} />
            
            {/* ── HERO COPY ── */}
            <div className="relative z-10 w-full h-full p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-green-500/40 bg-green-900/40 rounded-full px-3 py-1 text-xs font-semibold text-green-300 uppercase tracking-widest backdrop-blur-md w-max mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t('heroLiveRegion')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.1] text-white drop-shadow-lg mb-6 tracking-tight">
                {isHindi ? (
                  <>
                    ग्राम सशक्तीकरण<br />
                    <span className="text-amber-400">कचरा</span>
                    <span className="text-white">, </span>
                    <span className="text-cyan-400">जल</span>
                    <span className="text-white"> एवं </span>
                    <span className="text-yellow-400">सूर्य</span>
                    <span className="text-white"> से</span>
                  </>
                ) : (
                  <>
                    Powering Villages<br />
                    with{' '}
                    <span className="text-amber-400">Waste</span>
                    <span className="text-white">,{' '}</span>
                    <span className="text-cyan-400">Water</span>
                    <span className="text-white">{' '}&amp;{' '}</span>
                    <span className="text-yellow-400">Sun</span>
                  </>
                )}
              </h1>

              <p className="text-gray-200 text-lg leading-relaxed max-w-xl font-medium drop-shadow-md mb-8">
                {isHindi ? 'ग्राम ऊर्जा स्थानीय ग्रामीण संसाधनों को स्वच्छ ऊर्जा, कुशल जल प्रणालियों और मापने योग्य सामुदायिक प्रभाव में बदलता है — एक बार में एक गांव।' : 'Gram Urja transforms local village resources into clean energy, efficient water systems and measurable community impact — one village at a time.'}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/login"
                  className="group inline-flex items-center gap-2 bg-[#19c760] hover:bg-[#15ab52] text-white font-bold px-7 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5 text-sm">
                  <Zap className="w-4 h-4" />
                  {t('getStarted')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── MISSION STRIP ── */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
                🌱 {t('ourMission')}
              </div>
              <h2 className="text-2xl font-extrabold text-white leading-snug mb-3">
                Small steps create <span className="text-green-400">big change</span> for our villages.
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Every Indian village already possesses the natural ingredients for sustainable energy — <span className="text-green-400 font-semibold">abundant sunlight, organic biomass & agricultural residue</span>, and <span className="text-green-400 font-semibold">local self-reliance</span>. Gram Urja turns this untapped potential into measurable environmental and community benefit.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { n: '5', label: t('areasTracked') },
                  { n: '100%', label: t('formulaTransparency') },
                  { n: '2', label: t('cleanEnergyPillars') },
                  { n: '₹0', label: t('zeroToStart') }
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                    <div className="text-xl font-extrabold text-white">{s.n}</div>
                    <div className="text-[10px] text-gray-400 font-medium uppercase mt-1 tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: <Sun className="w-5 h-5 text-amber-400" />, title: t('solarUntapped'), desc: t('solarUntappedDesc'), accent: 'border-amber-400/20' },
                { icon: <Leaf className="w-5 h-5 text-emerald-400" />, title: t('wasteProblemPower'), desc: t('wasteProblemPowerDesc'), accent: 'border-emerald-400/20' },
                { icon: <Zap className="w-5 h-5 text-green-400" />, title: t('energyEfficiencyGrid'), desc: t('energyEfficiencyGridDesc'), accent: 'border-green-400/20' },
              ].map(card => (
                <div key={card.title} className={\`bg-white/5 border \${card.accent} rounded-xl p-4 flex gap-4 hover:bg-white/10 transition-colors\`}>
                  <div className="flex-shrink-0 p-2.5 bg-white/5 rounded-lg h-fit">{card.icon}</div>
                  <div>
                    <div className="font-bold text-white text-sm mb-1">{card.title}</div>
                    <div className="text-gray-400 text-xs leading-relaxed">{card.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>`;
content = content.replace(sectionRegex, newSection);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete');
