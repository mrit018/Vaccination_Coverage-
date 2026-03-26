// =============================================================================
// Village Health Population Dashboard - Type Definitions
// =============================================================================

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** Disease clinic codes for NCD tracking */
export type DiseaseCode =
  | '001' // DM - Diabetes Mellitus
  | '002' // HT - Hypertension
  | '003' // COPD
  | '004' // Asthma
  | '005' // TB - Tuberculosis
  | '006' // CKD - Chronic Kidney Disease
  | '007' // Cancer
  | '008'; // Psychiatry

/** Data loading states */
export type DataLoadingState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

/** Sort keys for village data */
export type SortKey =
  | 'villageMoo'
  | 'totalPopulation'
  | 'householdCount'
  | 'diseaseCount'
  | 'screeningCoverage';

// ---------------------------------------------------------------------------
// Core domain models
// ---------------------------------------------------------------------------

/** Aggregated population and health statistics for a single village */
export interface VillageSummary {
  villageId: number;
  villageMoo: string;
  villageName: string;
  householdCount: number;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  age0to14: number;
  age15to59: number;
  age60Plus: number;
  isOutOfArea: boolean;
}

/** Chronic disease prevalence for a specific village */
export interface DiseaseStatistics {
  villageId: number;
  diseaseCode: DiseaseCode;
  diseaseName: string;
  patientCount: number;
  screeningCoverage: number | null;
  lastScreeningDate: Date | null;
}

/** Complication screening results for DM/HT patients */
export interface ComorbidityStatistics {
  villageId: number;
  eyeComplication: number;
  footComplication: number;
  kidneyComplication: number;
  cardiovascularComplication: number;
  cerebrovascularComplication: number;
  peripheralVascularComplication: number;
  dentalComplication: number;
}

/** Aggregated view combining all health data for a village */
export interface VillageHealthData {
  village: VillageSummary;
  diseases: DiseaseStatistics[];
  comorbidities: ComorbidityStatistics | null;
}

// ---------------------------------------------------------------------------
// API Response models
// ---------------------------------------------------------------------------

/** Response shape for village list queries */
export interface VillageListResponse {
  villages: VillageHealthData[];
  totalCount: number;
  lastUpdated: Date;
}

// ---------------------------------------------------------------------------
// State management models
// ---------------------------------------------------------------------------

/** Filter options for village data */
export interface VillageFilter {
  searchQuery: string;
  minPopulation: number | null;
  diseaseCodes: DiseaseCode[];
  minScreeningCoverage: number | null;
}

/** Dashboard state management */
export interface DashboardState {
  dataState: DataLoadingState;
  villages: VillageHealthData[];
  selectedVillageId: number | null;
  filter: VillageFilter;
  sortBy: SortKey;
  sortOrder: 'asc' | 'desc';
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Disease code mapping
// ---------------------------------------------------------------------------

export const DISEASE_CODE_MAP: Record<DiseaseCode, string> = {
  '001': 'เบาหวาน',
  '002': 'ความดันโลหิตสูง',
  '003': 'ถุงลมโป่งพอง',
  '004': 'หอบหืด',
  '005': 'วัณโรค',
  '006': 'โรคไตเรื้อรัง',
  '007': 'มะเร็ง',
  '008': 'จิตเวช',
} as const;

/** Valid disease codes array for validation */
export const VALID_DISEASE_CODES: DiseaseCode[] = [
  '001',
  '002',
  '003',
  '004',
  '005',
  '006',
  '007',
  '008',
];
