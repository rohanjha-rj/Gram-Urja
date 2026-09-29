import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

export const TRANSLATIONS = {
  // Brand
  brandName: { en: 'GramUrja', hi: 'ग्रामऊर्जा' },
  brandTagline: { en: 'Village Sustainability Platform', hi: 'ग्रामीण संवहनीय ऊर्जा मंच' },
  aiName: { en: 'Manu AI', hi: 'मनु AI' },
  aiAssistantSubtitle: { en: 'Rural Energy & Sustainability Assistant', hi: 'ग्रामीण ऊर्जा एवं संवहनीयता सहायक' },
  regionName: { en: 'Bihar Village Sustainability Region', hi: 'बिहार ग्रामीण संवहनीयता प्रभाग' },

  // Navigation
  navOverview: { en: 'Overview', hi: 'अवलोकन' },
  navMyDashboard: { en: 'My Dashboard', hi: 'मेरा डैशबोर्ड' },
  navVillageDashboard: { en: 'Village Dashboard', hi: 'ग्राम डैशबोर्ड' },
  navSolar: { en: 'Solar', hi: 'सौर ऊर्जा' },
  navWaste: { en: 'Waste & Energy', hi: 'कचरा एवं ऊर्जा' },
  navRecommendations: { en: 'Recommendations', hi: 'अनुशंसाएं' },
  navAiAssistant: { en: 'Manu AI Assistant', hi: 'मनु AI सहायक' },
  logout: { en: 'Log out', hi: 'लॉग आउट' },

  // Roles
  roleOfficial: { en: 'Village Official', hi: 'ग्राम अधिकारी' },
  roleCitizen: { en: 'Household Member', hi: 'परिवार सदस्य' },
  roleGuest: { en: 'Guest', hi: 'अतिथि' },
  govAccess: { en: 'Government Access', hi: 'प्रशासनिक पहुंच' },
  panchayatOfficer: { en: 'Panchayat / Ward Officer', hi: 'पंचायत / वार्ड अधिकारी' },
  householdAccess: { en: 'Household Access', hi: 'घरेलू पहुंच' },
  residentCitizen: { en: 'Resident / Citizen', hi: 'निवासी / नागरिक' },

  // Login & Auth
  chooseRole: { en: 'Choose your role to continue', hi: 'आगे बढ़ने के लिए अपनी भूमिका चुनें' },
  enterVillageDashboard: { en: 'Enter Village Overview', hi: 'ग्राम अवलोकन में प्रवेश करें' },
  selectVillagePortal: { en: 'Choose Monitored Village', hi: 'निगरानी ग्राम चुनें' },
  villageOfficialPortals: { en: '5 Monitored Village Official Portals', hi: '5 निगरानी ग्राम अधिकारी पोर्टल' },
  enterAllVillages: { en: 'Enter All-Village Command Center', hi: 'समस्त ग्राम कमांड सेंटर में प्रवेश करें' },
  quickVillageSelect: { en: 'Quick Login by Village:', hi: 'त्वरित ग्राम लॉगिन:' },
  loginAsOfficialFor: { en: 'Login as Official', hi: 'अधिकारी लॉगिन' },
  officialDesc: {
    en: 'For Panchayat members, Ward officers, and local administrators. Direct access to 5 monitored village command centers and infrastructure data.',
    hi: 'पंचायत सदस्यों, वार्ड अधिकारियों और प्रशासकों के लिए। 5 निगरानी ग्रामों के कमांड सेंटर और बुनियादी ढांचा डेटा तक सीधी पहुंच।'
  },
  householdDesc: {
    en: 'Track your appliances, calculate energy costs, and get personalized recommendations to save money and energy.',
    hi: 'अपने उपकरणों को ट्रैक करें, बिजली खर्च घटाएं और ऊर्जा बचत के व्यक्तिगत सुझाव प्राप्त करें।'
  },
  logIn: { en: 'Log In', hi: 'लॉग इन' },
  signUp: { en: 'Sign Up', hi: 'साइन अप' },
  emailAddress: { en: 'Email address', hi: 'ईमेल पता' },
  password: { en: 'Password', hi: 'पासवर्ड' },
  explorePlatform: { en: 'Just browsing? Explore the platform', hi: 'केवल देखना चाहते हैं? प्लेटफ़ॉर्म देखें' },
  backToRoleSelection: { en: 'Back to role selection', hi: 'भूमिका चयन पर वापस जाएं' },
  sampleCredentials: { en: 'Sample Login Credentials', hi: 'नमूना लॉगिन क्रेडेंशियल' },
  autoFillSample: { en: 'Auto-fill Sample', hi: 'स्वतः भरें' },

  // Landing Page
  heroLiveRegion: { en: 'Live · Bihar Village Sustainability Region', hi: 'लाइव · बिहार ग्रामीण संवहनीयता क्षेत्र' },
  heroTitleMain: { en: 'Powering Villages with', hi: 'ग्राम सशक्तीकरण' },
  heroWaste: { en: 'Waste', hi: 'कचरा' },
  heroWater: { en: 'Water', hi: 'जल' },
  heroSun: { en: 'Sun', hi: 'सूर्य' },
  heroSubtitle: {
    en: 'GramUrja transforms local village resources into clean energy, efficient water systems and measurable community impact — one village at a time.',
    hi: 'ग्रामऊर्जा स्थानीय ग्रामीण संसाधनों को स्वच्छ ऊर्जा, कुशल जल प्रणाली और ठोस सामुदायिक लाभ में बदलता है — एक-एक गांव करके।'
  },
  getStarted: { en: 'Get Started — Choose Your Role', hi: 'शुरू करें — अपनी भूमिका चुनें' },
  ourMission: { en: 'Our Mission', hi: 'हमारा लक्ष्य' },
  missionHeading: { en: 'Small steps create big change for our villages.', hi: 'छोटे कदम हमारे गांवों में बड़ा बदलाव लाते हैं।' },
  missionText: {
    en: 'Every Indian village already possesses the natural ingredients for sustainable energy — abundant sunlight, organic biomass & agricultural residue, and local self-reliance. GramUrja turns this untapped potential into measurable environmental and community benefit.',
    hi: 'प्रत्येक भारतीय गांव में संवहनीय ऊर्जा के प्राकृतिक स्रोत पहले से मौजूद हैं — प्रचुर धूप, जैविक कचरा एवं कृषि अवशेष, और आत्मनिर्भरता। ग्रामऊर्जा इस क्षमता को वास्तविक लाभ में बदलता है।'
  },
  areasTracked: { en: 'Areas tracked', hi: 'निगरानी क्षेत्र' },
  formulaTransparency: { en: 'Formula transparency', hi: 'पारदर्शी गणना' },
  cleanEnergyPillars: { en: 'Clean Energy Pillars', hi: 'स्वच्छ ऊर्जा स्तंभ' },
  zeroToStart: { en: 'To get started', hi: 'शुरुआत के लिए' },
  solarUntapped: { en: 'Solar — Untapped Potential', hi: 'सौर ऊर्जा — प्रचुर संभावना' },
  solarUntappedDesc: { en: 'Most village rooftops can offset 30–60% of electricity demand.', hi: 'अधिकांश ग्रामीण छतें बिजली मांग का 30-60% पूरा कर सकती हैं।' },
  wasteProblemPower: { en: 'Waste — From Problem to Power', hi: 'कचरा — समस्या से शक्ति तक' },
  wasteProblemPowerDesc: { en: 'Cow dung, food and agricultural residue generate biogas for cooking and electricity.', hi: 'गोबर, भोजन और कृषि अपशिष्ट से रसोई और बिजली के लिए बायोगैस।' },
  energyEfficiencyGrid: { en: 'Energy Efficiency — Smarter Grid', hi: 'ऊर्जा दक्षता — स्मार्ट ग्रिड' },
  energyEfficiencyGridDesc: { en: 'Smart appliance monitoring and LED microgrids optimize village power balance.', hi: 'उपकरण निगरानी और एलईडी माइक्रो-ग्रिड से ऊर्जा संतुलन।' },
  liveVillageImpact: { en: 'Live Village Impact', hi: 'लाइव ग्रामीण प्रभाव' },
  realNumbersRealChange: { en: 'Real Numbers. Real Change.', hi: 'वास्तविक आंकड़े. वास्तविक बदलाव.' },
  aggregatedImpactDesc: {
    en: 'Aggregated daily impact across all 5 areas of Bihar Village region — calculated from live data using transparent formulas.',
    hi: 'बिहार ग्रामीण क्षेत्र के सभी 5 क्षेत्रों का दैनिक संचयी प्रभाव — पारदर्शी सूत्रों द्वारा लाइव डेटा से गणना।'
  },
  solarPotentialLabel: { en: 'Solar Potential', hi: 'सौर क्षमता' },
  solarPotentialSub: { en: 'Feasible daily generation across all areas', hi: 'सभी क्षेत्रों में दैनिक उत्पादन संभावना' },
  wasteCollectedLabel: { en: 'Waste Collected', hi: 'कचरा संग्रहण' },
  wasteCollectedSub: { en: 'Organic waste available for biogas recovery', hi: 'बायोगैस के लिए उपलब्ध जैविक कचरा' },
  co2MitigatedLabel: { en: 'CO₂ Mitigated', hi: 'CO₂ निवारण' },
  co2MitigatedSub: { en: 'Clean energy carbon offset per day', hi: 'प्रतिदिन कार्बन उत्सर्जन में कमी' },
  energyGeneratedLabel: { en: 'Energy Generated', hi: 'उत्पादित ऊर्जा' },
  energyGeneratedSub: { en: 'Biogas + existing solar combined', hi: 'बायोगैस एवं सौर ऊर्जा का कुल उत्पादन' },
  howGramUrjaWorks: { en: 'How GramUrja Works', hi: 'ग्रामऊर्जा कैसे काम करता है' },
  circularModel: { en: 'Circular Sustainability Model', hi: 'चक्रीय संवहनीय मॉडल' },
  circularModelDesc: {
    en: 'Village resources flow through a closed-loop system — each input becomes an output that feeds the next.',
    hi: 'ग्रामीण संसाधन एक चक्रीय प्रणाली में प्रवाहित होते हैं — प्रत्येक संसाधन अगले चक्र को ऊर्जा प्रदान करता है।'
  },
  closedLoopNote: { en: 'Closed-loop circular model — each output feeds the next input', hi: 'बंद चक्रीय मॉडल — प्रत्येक उत्पाद अगले चरण का इनपुट बनता है' },

  // Village Dashboard
  commandCenterTitle: { en: 'Community Sustainability Command Centre', hi: 'सामुदायिक संवहनीयता कमांड सेंटर' },
  commandCenterSubtitle: { en: 'Bihar Village Sustainability Region · 5 areas monitored', hi: 'बिहार ग्रामीण संवहनीयता क्षेत्र · 5 क्षेत्र सक्रिय' },
  totalConsumption: { en: 'Total Consumption', hi: 'कुल बिजली खपत' },
  totalCost: { en: 'Total Cost', hi: 'कुल लागत' },
  totalCO2: { en: 'Total CO₂', hi: 'कुल CO₂ उत्सर्जन' },
  renewableShare: { en: 'Renewable Share', hi: 'नवीकरणीय ऊर्जा हिस्सा' },
  searchPlaceholder: { en: 'Search village, ward or town...', hi: 'गांव, वार्ड या कस्बा खोजें...' },
  filtersBtn: { en: 'Filters', hi: 'फ़िल्टर' },
  clearFilters: { en: 'Clear all filters', hi: 'सभी फ़िल्टर हटाएं' },
  minConsumption: { en: 'Min Consumption (kWh)', hi: 'न्यूनतम खपत (kWh)' },
  maxConsumption: { en: 'Max Consumption (kWh)', hi: 'अधिकतम खपत (kWh)' },
  minPopulation: { en: 'Min Population', hi: 'न्यूनतम जनसंख्या' },
  maxPopulation: { en: 'Max Population', hi: 'अधिकतम जनसंख्या' },
  clickAreaHint: { en: 'Click any area card for detailed analysis', hi: 'विस्तृत विश्लेषण के लिए किसी भी क्षेत्र कार्ड पर क्लिक करें' },
  backToOverview: { en: 'Back to overview', hi: 'अवलोकन पर वापस जाएं' },
  viewDetails: { en: 'View details →', hi: 'विवरण देखें →' },
  currentStatus: { en: 'Current Monthly Status', hi: 'वर्तमान मासिक स्थिति' },
  potentialOptimizedStatus: { en: 'Potential Optimized Status', hi: 'संभावित अनुकूलित स्थिति' },
  consumption: { en: 'Consumption', hi: 'खपत' },
  gridConsumption: { en: 'Grid Consumption', hi: 'ग्रिड से खपत' },
  electricityCost: { en: 'Electricity Cost', hi: 'बिजली खर्च' },
  co2Emissions: { en: 'CO₂ Emissions', hi: 'CO₂ उत्सर्जन' },
  renewableEnergy: { en: 'Renewable Energy', hi: 'नवीकरणीय ऊर्जा' },
  energyBreakdown: { en: 'Energy Breakdown', hi: 'ऊर्जा विभाजन' },
  energyBreakdownSub: { en: 'Monthly consumption by category', hi: 'श्रेणीवार मासिक खपत' },
  solarOpportunityTitle: { en: 'Solar Opportunity', hi: 'सौर ऊर्जा अवसर' },
  solarOpportunitySub: { en: 'Turn empty rooftops into a power plant', hi: 'खाली छतों को बिजली घर में बदलें' },
  maxFeasibleCapacity: { en: 'Max Feasible Capacity', hi: 'अधिकतम साध्य क्षमता' },
  freePower: { en: 'Free Power', hi: 'मुफ़्त ऊर्जा' },
  environment: { en: 'Environment', hi: 'पर्यावरण' },
  estimatedInvestment: { en: 'Estimated Investment', hi: 'अनुमानित निवेश' },
  paysForItselfIn: { en: 'Pays for itself in', hi: 'लागत वसूली समय' },
  years: { en: 'Years', hi: 'वर्ष' },
  biogasOpportunityTitle: { en: 'Biogas Opportunity', hi: 'बायोगैस अवसर' },
  biogasOpportunitySub: { en: 'Convert daily waste into valuable energy', hi: 'दैनिक कचरे को मूल्यवान ऊर्जा में बदलें' },
  dailyGasProduction: { en: 'Daily Gas Production', hi: 'दैनिक गैस उत्पादन' },
  thermalEnergy: { en: 'Thermal Energy', hi: 'तापीय ऊर्जा' },
  usefulForCooking: { en: 'Useful for cooking', hi: 'रसोई पकाने के लिए उपयोगी' },
  environmentalImpact: { en: 'Environmental Impact', hi: 'पर्यावरणीय प्रभाव' },
  radarProfileTitle: { en: 'Resource & Performance Balance Profile', hi: 'संसाधन एवं प्रदर्शन संतुलन प्रोफ़ाइल' },
  radarProfileSub: { en: 'Multi-dimensional sustainability and resource coverage', hi: 'बहु-आयामी संवहनीयता एवं संसाधन कवरेज' },

  // Household Dashboard
  householdTitle: { en: 'Household Energy & Resource Tracker', hi: 'घरेलू ऊर्जा एवं संसाधन ट्रैकर' },
  householdSubtitle: { en: 'Calculate appliance consumption, electricity bills, and clean energy potential', hi: 'उपकरण खपत, बिजली बिल और स्वच्छ ऊर्जा बचत की गणना करें' },
  monthlyCost: { en: 'Monthly Cost', hi: 'मासिक लागत' },
  co2Footprint: { en: 'CO₂ Footprint', hi: 'CO₂ उत्सर्जन' },
  waterDemand: { en: 'Water Demand', hi: 'जल मांग' },
  biogasPotential: { en: 'Biogas Potential', hi: 'बायोगैस क्षमता' },
  myAppliances: { en: 'My Appliances', hi: 'मेरे उपकरण' },
  addAppliance: { en: 'Add Appliance', hi: 'उपकरण जोड़ें' },
  applianceCount: { en: 'Appliances configured', hi: 'कॉन्फ़िगर किए गए उपकरण' },
  householdMembers: { en: 'Household Members', hi: 'परिवार के सदस्य' },
  resetDefaults: { en: 'Reset to Defaults', hi: 'डिफ़ॉल्ट पर रीसेट करें' },
  hoursPerDay: { en: 'Hours / day', hi: 'घंटे / दिन' },
  watts: { en: 'Watts', hi: 'वाट' },
  monthlyKWh: { en: 'Monthly kWh', hi: 'मासिक kWh' },
  quickAdd: { en: 'Quick Add Appliance', hi: 'उपकरण तुरंत जोड़ें' },

  // Solar Page
  solarPageTitle: { en: 'Solar Rooftop & Ground Potential', hi: 'सौर रूफटॉप एवं ग्राउंड क्षमता' },
  solarPageSubtitle: { en: 'Physics-based solar sizing with MNRE benchmark pricing and subsidies', hi: 'नवीन एवं नवीकरणीय ऊर्जा मंत्रालय (MNRE) मानकों पर आधारित सौर विश्लेषण' },
  rooftopCalculator: { en: 'Rooftop Solar Sizing Calculator', hi: 'रूफटॉप सौर कैलकुलेटर' },
  groundMountedSolar: { en: 'Ground-Mounted Solar Potential', hi: 'ग्राउंड-माउंटेड सौर क्षमता' },
  subsidyAssistance: { en: 'PM Surya Ghar & Central Financial Assistance', hi: 'पीएम सूर्य घर एवं केंद्रीय वित्तीय सहायता' },

  // Waste Page
  wastePageTitle: { en: 'Waste-to-Energy & Biogas Potential', hi: 'कचरा-से-ऊर्जा एवं बायोगैस क्षमता' },
  wastePageSubtitle: { en: 'Biomass energy calculations, bio-slurry fertilizer output and SATAT scheme', hi: 'बायोमास ऊर्जा गणना, जैविक खाद और सतत (SATAT) योजना' },

  // Recommendations
  recommendationsTitle: { en: 'Priority Action Recommendations', hi: 'प्राथमिकता कार्य अनुशंसाएं' },
  recommendationsSubtitle: { en: 'Data-driven interventions · Cost & CO₂ impact ranking', hi: 'डेटा-आधारित समाधान · लागत एवं CO₂ बचत क्रम' },
  problemLabel: { en: 'The Problem', hi: 'समस्या' },
  solutionLabel: { en: 'The Solution', hi: 'समाधान' },
  savingsPerMonth: { en: 'savings/mo', hi: 'मासिक बचत' },

  // AI Assistant
  askManuPlaceholder: { en: 'Ask Manu AI about energy, solar, waste, savings...', hi: 'मनु AI से ऊर्जा, सोलर, कचरा, बचत के बारे में पूछें...' },
  chatWithManu: { en: 'Chat with Manu AI', hi: 'मनु AI से बातचीत करें' },
  voiceInputTitle: { en: 'Voice input (Hindi & English supported)', hi: 'आवाज इनपुट (हिंदी और अंग्रेजी समर्थित)' },
  listening: { en: 'Listening...', hi: 'सुन रहे हैं...' },
  listen: { en: 'Listen', hi: 'सुनें' },
  stop: { en: 'Stop', hi: 'रोकें' },
  openRelatedPage: { en: 'Open related page', hi: 'संबंधित पृष्ठ खोलें' },
  userBadge: { en: 'You', hi: 'आप' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gramurja_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gramurja_lang', lang);
  };

  const t = (key: string): string => {
    const item = (TRANSLATIONS as any)[key];
    if (!item) return key;
    return item[language] || item['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHindi: language === 'hi' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
