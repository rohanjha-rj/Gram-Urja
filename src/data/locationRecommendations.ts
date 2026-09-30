/**
 * Recommended installation locations for solar panels and biogas plants
 * per village — grounded in real Bihar facility & waste-feedstock data.
 */

export interface SolarLocationRec {
  villageId: string;
  villageName: string;
  address: string;
  priorityReason: string;
  confidence: 'verified' | 'candidate';
}

export interface BiogasLocationRec {
  villageId: string;
  villageName: string;
  address: string;
  priorityReason: string;
  feedstockSurveyNeeded: boolean;
}

export const SOLAR_LOCATION_RECS: SolarLocationRec[] = [
  {
    villageId: 'motipur',
    villageName: 'Motipur GP, Samastipur',
    address: 'Government Primary/Middle School cluster, Motipur, Tajpur, Samastipur, Bihar',
    priorityReason:
      'Motipur has multiple government primary and middle schools plus a health sub-centre. A school/health-centre rooftop can serve daytime educational and healthcare loads while providing a visible community demonstration.',
    confidence: 'verified',
  },
  {
    villageId: 'oiara',
    villageName: 'Oiara, Sonmai GP, Patna',
    address: 'M.S. School, Oiyara, Dhanarua, Patna, Bihar – 804451',
    priorityReason:
      'Oiara has a government primary/middle-school presence and a health sub-centre; historical records also show incomplete household electrification, making a community solar installation particularly relevant for essential services.',
    confidence: 'verified',
  },
  {
    villageId: 'amra',
    villageName: 'Amra, Amara Panchayat, Arwal',
    address: 'Government Primary/Middle School area, Amra, Arwal, Bihar – 804402',
    priorityReason:
      'Amra has government primary and middle schools and a primary health sub-centre/maternity & child-welfare facility. Solar at this cluster can support both education and essential healthcare loads.',
    confidence: 'verified',
  },
  {
    villageId: 'korha',
    villageName: 'Korha, Bhagalpur',
    address: 'Health Sub-Centre / Primary School area, Korha, Goradih, Bhagalpur, Bihar – 813210',
    priorityReason:
      'Korha has a health sub-centre within the village and a primary school. Village data reports electricity availability of only 8–12 hours/day (2020 survey), making essential-service backup a critical consideration.',
    confidence: 'verified',
  },
  {
    villageId: 'barouni',
    villageName: 'Barouni-III, Begusarai',
    address: 'Government-school/health-service cluster, Barouni-III, Barouni, Begusarai, Bihar',
    priorityReason:
      'Candidate site — the available search results did not provide sufficiently reliable village-level facility coordinates to name a specific school/health centre without risking a wrong location. Field verification is recommended before committing to a site.',
    confidence: 'candidate',
  },
];

export const BIOGAS_LOCATION_RECS: BiogasLocationRec[] = [
  {
    villageId: 'motipur',
    villageName: 'Motipur GP, Samastipur',
    address: 'Motipur village sanitation/drainage & livestock/agricultural cluster, Tajpur, Samastipur',
    priorityReason:
      'Motipur has substantial agricultural activity with reported open drainage. Livestock and agricultural residues (900 kg/day dung + 284 kg/day agri waste) can provide continuous feedstock. A detailed waste/animal-dung survey should determine final plant size.',
    feedstockSurveyNeeded: true,
  },
  {
    villageId: 'oiara',
    villageName: 'Oiara, Sonmai GP, Patna',
    address: 'Oiara village sanitation/agricultural cluster, Dhanarua, Patna – 804451',
    priorityReason:
      'Oiara has agricultural activity, open drainage and a health/education cluster. A decentralised biogas unit could process segregated organic waste (400 kg/day dung + 94 kg/day agri waste) if sufficient daily feedstock is confirmed.',
    feedstockSurveyNeeded: true,
  },
  {
    villageId: 'amra',
    villageName: 'Amra, Amara Panchayat, Arwal',
    address: 'Amra village agricultural/animal-waste cluster, Arwal, Bihar – 804402',
    priorityReason:
      'Amra has a large agricultural area with extensive irrigation activity; this makes agricultural residue (500 kg/day dung + 103 kg/day agri waste) and livestock-waste availability worth surveying before sizing a biogas plant.',
    feedstockSurveyNeeded: true,
  },
];
