// =============================================================================
// Village Health Population Dashboard - Data Transformers
// =============================================================================

import type {
  VillageSummary,
  DiseaseStatistics,
  ComorbidityStatistics,
  DiseaseCode,
  ScreeningCoverage,
} from '@/types/villageHealth';
import { DISEASE_CODE_MAP } from '@/types/villageHealth';
import {
  isSmallVillage,
  getPrivacyMessage,
} from '@/utils/villageHealthValidation';

// ---------------------------------------------------------------------------
// Raw Query Result Types
// ---------------------------------------------------------------------------

interface RawVillageResult {
  village_id: number;
  village_moo: string;
  village_name: string;
  household_count: number;
  total_population: number;
  male_count: number;
  female_count: number;
  age_0_14: number;
  age_15_59: number;
  age_60_plus: number;
}

interface RawDiseaseResult {
  village_id: number;
  village_moo: string;
  village_name: string;
  disease_code: string;
  disease_name: string;
  patient_count: number;
}

interface RawComorbidityResult {
  village_id: number;
  village_moo: string;
  village_name: string;
  eye_complication: number;
  foot_complication: number;
  kidney_complication: number;
  cardiovascular_complication: number;
  cerebrovascular_complication: number;
  peripheral_vascular_complication: number;
  dental_complication: number;
}

// ---------------------------------------------------------------------------
// Village Summary Transformer
// ---------------------------------------------------------------------------

/**
 * Transform a raw SQL result row into a VillageSummary domain model.
 * Applies privacy protection for small villages.
 */
export function toVillageSummary(row: RawVillageResult): VillageSummary {
  const isSmall = isSmallVillage(row.total_population);

  return {
    villageId: row.village_id,
    villageMoo: row.village_moo,
    villageName: row.village_name,
    householdCount: isSmall ? 0 : (row.household_count ?? 0),
    totalPopulation: row.total_population ?? 0,
    maleCount: isSmall ? 0 : (row.male_count ?? 0),
    femaleCount: isSmall ? 0 : (row.female_count ?? 0),
    age0to14: isSmall ? 0 : (row.age_0_14 ?? 0),
    age15to59: isSmall ? 0 : (row.age_15_59 ?? 0),
    age60Plus: isSmall ? 0 : (row.age_60_plus ?? 0),
    isOutOfArea: row.village_moo === '0',
  };
}

// ---------------------------------------------------------------------------
// Disease Statistics Transformer
// ---------------------------------------------------------------------------

/**
 * Transform raw disease query results into DiseaseStatistics array.
 * Groups by village and ensures all 8 disease types are represented.
 */
export function toDiseaseStatistics(
  rows: RawDiseaseResult[],
  villageId: number,
): DiseaseStatistics[] {
  const villageDiseases = rows.filter((r) => r.village_id === villageId);

  // Create a map for quick lookup
  const diseaseMap = new Map<string, RawDiseaseResult>();
  for (const row of villageDiseases) {
    diseaseMap.set(row.disease_code, row);
  }

  // Ensure all 8 disease types are represented
  const allDiseaseCodes: DiseaseCode[] = ['001', '002', '003', '004', '005', '006', '007', '008'];

  return allDiseaseCodes.map((code) => {
    const row = diseaseMap.get(code);
    return {
      villageId,
      diseaseCode: code,
      diseaseName: row?.disease_name ?? DISEASE_CODE_MAP[code],
      patientCount: row?.patient_count ?? 0,
      screeningCoverage: null,
      lastScreeningDate: null,
    };
  });
}

/**
 * Transform a single raw disease result row.
 */
export function toDiseaseStatistic(row: RawDiseaseResult): DiseaseStatistics {
  return {
    villageId: row.village_id,
    diseaseCode: row.disease_code as DiseaseCode,
    diseaseName: row.disease_name,
    patientCount: row.patient_count ?? 0,
    screeningCoverage: null,
    lastScreeningDate: null,
  };
}

// ---------------------------------------------------------------------------
// Screening Coverage Transformer
// ---------------------------------------------------------------------------

/**
 * Transform screening query results and update disease statistics.
 * Merges DM/HT screening coverage into existing disease statistics.
 */
export function mergeScreeningCoverage(
  diseases: DiseaseStatistics[],
  screening: ScreeningCoverage,
): DiseaseStatistics[] {
  return diseases.map((disease) => {
    if (disease.diseaseCode === '001') {
      return {
        ...disease,
        screeningCoverage: screening.dmCoveragePercent ?? 0,
      };
    }
    if (disease.diseaseCode === '002') {
      return {
        ...disease,
        screeningCoverage: screening.htCoveragePercent ?? 0,
      };
    }
    return disease;
  });
}

// ---------------------------------------------------------------------------
// Comorbidity Statistics Transformer
// ---------------------------------------------------------------------------

/**
 * Transform raw comorbidity query result into ComorbidityStatistics.
 */
export function toComorbidityStatistics(row: RawComorbidityResult): ComorbidityStatistics {
  return {
    villageId: row.village_id,
    eyeComplication: row.eye_complication ?? 0,
    footComplication: row.foot_complication ?? 0,
    kidneyComplication: row.kidney_complication ?? 0,
    cardiovascularComplication: row.cardiovascular_complication ?? 0,
    cerebrovascularComplication: row.cerebrovascular_complication ?? 0,
    peripheralVascularComplication: row.peripheral_vascular_complication ?? 0,
    dentalComplication: row.dental_complication ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Display Helpers
// ---------------------------------------------------------------------------

/**
 * Format population count for display.
 * Returns privacy message for small villages.
 */
export function formatPopulationForDisplay(
  count: number,
  isProtected: boolean,
): string | number {
  if (isProtected && count > 0 && count < 10) {
    return getPrivacyMessage();
  }
  return count;
}

/**
 * Format percentage for display.
 */
export function formatPercentage(value: number | null): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Get display label for a village.
 * Includes "Out of Area" badge text if applicable.
 */
export function getVillageDisplayLabel(village: VillageSummary): string {
  if (village.isOutOfArea) {
    return `${village.villageName} (นอกเขต)`;
  }
  return `หมู่ ${village.villageMoo} - ${village.villageName}`;
}
