const fs = require('fs');

const path = '/Users/saumyaprincep/IBM$/Gram-Urja/src/pages/LandingPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace VillageScene with HeroBackground
const oldVillageScene = `function VillageScene({ isHindi }: { isHindi: boolean }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % HERO_PHOTOS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto select-none rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/10' }}>
      {HERO_PHOTOS.map((photo, i) => (
        <img key={photo.url} src={photo.url} alt={isHindi ? photo.labelHi : photo.labelEn} loading={i === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === active ? 1 : 0 }} />
      ))}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.28) 0%,transparent 50%,rgba(0,0,0,0.35) 100%)' }} />
      {[
        { pos: 'top-3 left-3',      bg: 'bg-amber-400/90',   textEn: '☀️ Solar',  textHi: '☀️ सौर' },
        { pos: 'top-3 right-3',     bg: 'bg-emerald-500/90', textEn: '🌿 Biogas', textHi: '🌿 बायोगैस' },
        { pos: 'bottom-12 right-3', bg: 'bg-green-600/90',   textEn: '⚡ Power',  textHi: '⚡ ऊर्जा' },
      ].map(b => (
        <div key={b.pos}
          className={\`absolute \${b.pos} \${b.bg} text-white text-xs font-bold px-2.5 py-1 rounded-full gu-hero-badge\`}
          style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', boxShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
          {isHindi ? b.textHi : b.textEn}
        </div>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {HERO_PHOTOS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={\`h-1.5 rounded-full transition-all duration-300 \${i === active ? 'bg-white w-5' : 'bg-white/50 w-1.5'}\`} />
        ))}
      </div>
    </div>
  );
}`;

const newHeroBackground = `function HeroBackground({ isHindi }: { isHindi: boolean }) {
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
      <div className="absolute inset-0 bg-black/65" />
    </div>
  );
}`;

content = content.replace(oldVillageScene, newHeroBackground);


const oldSectionRegex = /<section\s+className="relative flex flex-col overflow-hidden"\s+style=\{\{[\s\S]*?<\/section>/;

const newSection = `<section
        className="relative flex flex-col overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        <HeroBackground isHindi={isHindi} />
        
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
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="max-w-7xl mx-auto w-full px-6 flex flex-col gap-12 mt-12">
            
            {/* ── HERO COPY ── */}
            <div className="gu-hero-text space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 border border-green-400/30 bg-green-400/20 rounded-full px-3 py-1 text-xs font-semibold text-green-200 uppercase tracking-widest backdrop-blur-md">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t('heroLiveRegion')}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.15] text-white drop-shadow-lg">
                {isHindi ? (
                  <>
                    ग्राम सशक्तीकरण<br />
                    <span className="text-amber-400">कचरा</span>
                    <span className="text-white">, </span>
                    <span className="text-green-400">जल</span>
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
                    <span className="text-green-400">Water</span>
                    <span className="text-white">{' '}&amp;{' '}</span>
                    <span className="text-yellow-400">Sun</span>
                  </>
                )}
              </h1>

              <p className="text-gray-200 text-lg leading-relaxed max-w-xl font-medium drop-shadow-md">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/login"
                  className="group inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-7 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 hover:-translate-y-0.5 text-sm">
                  <Zap className="w-4 h-4" />
                  {t('getStarted')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a href="#impact"
                  className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 border border-white/20 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 backdrop-blur-md text-sm">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  {isHindi ? 'लाइव प्रभाव देखें' : 'View Live Impact'}
                </a>
              </div>
            </div>

            {/* ── MISSION STRIP ── */}
            <div className="border-t border-white/20 pt-8 mt-4 grid lg:grid-cols-2 gap-8 items-start bg-black/40 p-8 rounded-2xl backdrop-blur-md">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-400/20 border border-green-400/30 text-green-300 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
                  🌱 {t('ourMission')}
                </div>
                <h2 className="text-2xl font-extrabold text-white leading-snug mb-3 drop-shadow-md">
                  {t('missionHeading')}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed mb-5 drop-shadow-md">
                  {t('missionText')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { n: '5', label: t('areasTracked') },
                    { n: '100%', label: t('formulaTransparency') },
                    { n: '2', label: t('cleanEnergyPillars') },
                    { n: '₹0', label: t('zeroToStart') }
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-md rounded-xl px-4 py-2 text-center">
                      <div className="text-lg font-extrabold text-white">{s.n}</div>
                      <div className="text-[10px] text-green-300 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: <Sun className="w-5 h-5 text-amber-400" />, title: t('solarUntapped'), desc: t('solarUntappedDesc'), accent: 'border-amber-400/40' },
                  { icon: <Leaf className="w-5 h-5 text-emerald-400" />, title: t('wasteProblemPower'), desc: t('wasteProblemPowerDesc'), accent: 'border-emerald-400/40' },
                  { icon: <Zap className="w-5 h-5 text-green-400" />, title: t('energyEfficiencyGrid'), desc: t('energyEfficiencyGridDesc'), accent: 'border-green-400/40' },
                ].map(card => (
                  <div key={card.title} className={\`bg-black/40 border \${card.accent} backdrop-blur-md rounded-xl p-4 flex gap-4 hover:bg-black/60 transition-colors\`}>
                    <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg h-fit">{card.icon}</div>
                    <div>
                      <div className="font-bold text-white text-sm mb-1">{card.title}</div>
                      <div className="text-gray-300 text-xs leading-relaxed">{card.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>`;

content = content.replace(oldSectionRegex, newSection);
fs.writeFileSync(path, content, 'utf8');
console.log('Done replacement');
