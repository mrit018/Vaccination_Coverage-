// =============================================================================
// Village Health Population Dashboard - Data Validation
// =============================================================================

import type {
  VillageSummary,
  DiseaseStatistics,
  DiseaseCode,
} from '@/types/villageHealth';

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Disease code validation
// ---------------------------------------------------------------------------

const VALID_CODES: DiseaseCode[] = ['001', '002', '003', '004', '005', '006', '007', '008'];

const DISEASE_CODE_NAMES: Record<DiseaseCode, string> = {
  '001': 'เบาหวาน',
  '002': 'ความดันโลหิตสูง',
  '003': 'ถุงลมโป่งพอง',
  '004': 'หอบหืด',
  '005': 'วัณโรค',
  '006': 'โรคไตเรื้อรัง',
  '007': 'มะเร็ง',
  '008': 'จิตเวช',
};

// ---------------------------------------------------------------------------
// Village Summary Validation
// ---------------------------------------------------------------------------

/**
 * Validate a VillageSummary object for data integrity.
 */
export function validateVillageSummary(data: VillageSummary): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (data.villageId === undefined || data.villageId === null) {
    errors.push('villageId is required');
  }

  if (!data.villageMoo && data.villageMoo !== '0') {
    errors.push('villageMoo is required');
  }

  // Check population consistency
  const genderSum = data.maleCount + data.femaleCount;
  if (data.totalPopulation !== genderSum) {
    errors.push(
      `Population mismatch: total (${data.totalPopulation}) != male (${data.maleCount}) + female (${data.femaleCount}) = ${genderSum}`,
    );
  }

  const ageSum = data.age0to14 + data.age15to59 + data.age60Plus;
  if (data.totalPopulation !== ageSum) {
    errors.push(
      `Age group mismatch: total (${data.totalPopulation}) != age groups sum (${ageSum})`,
    );
  }

  // Check non-negative counts
  if (data.householdCount < 0) {
    errors.push('householdCount cannot be negative');
  }

  if (data.totalPopulation < 0) {
    errors.push('totalPopulation cannot be negative');
  }

  if (data.maleCount < 0) {
    errors.push('maleCount cannot be negative');
  }

  if (data.femaleCount < 0) {
    errors.push('femaleCount cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Disease Statistics Validation
// ---------------------------------------------------------------------------

/**
 * Validate an array of DiseaseStatistics.
 */
export function validateDiseaseStatistics(data: DiseaseStatistics[]): ValidationResult {
  const errors: string[] = [];

  for (const disease of data) {
    // Check disease code
    if (!VALID_CODES.includes(disease.diseaseCode)) {
      errors.push(`Invalid disease code: ${disease.diseaseCode}`);
    }

    // Check village ID
    if (disease.villageId === undefined || disease.villageId === null) {
      errors.push(`Disease ${disease.diseaseCode}: villageId is required`);
    }

    // Check patient count
    if (disease.patientCount < 0) {
      errors.push(`Disease ${disease.diseaseCode}: patient count cannot be negative`);
    }

    // Check screening coverage
    if (disease.screeningCoverage !== null) {
      if (disease.screeningCoverage < 0 || disease.screeningCoverage > 100) {
        errors.push(
          `Disease ${disease.diseaseCode}: screening coverage must be between 0 and 100 (got ${disease.screeningCoverage})`,
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Raw Query Result Validation
// ---------------------------------------------------------------------------

/**
 * Validate a raw village query result row.
 */
export function validateRawVillageResult(row: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const requiredFields = ['village_id', 'village_moo', 'village_name'];

  for (const field of requiredFields) {
    if (row[field] === undefined || row[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  const numericFields = [
    'household_count',
    'total_population',
    'male_count',
    'female_count',
    'age_0_14',
    'age_15_59',
    'age_60_plus',
  ];

  for (const field of numericFields) {
    const value = row[field];
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`Field ${field} must be a valid number`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ---------------------------------------------------------------------------
// Small Village Privacy Check
// ---------------------------------------------------------------------------

/** Minimum population threshold for privacy protection */
export const PRIVACY_THRESHOLD = 10;

/**
 * Check if a village has too few residents to display detailed statistics.
 */
export function isSmallVillage(population: number): boolean {
  return population > 0 && population < PRIVACY_THRESHOLD;
}

/**
 * Get privacy protection message for small villages.
 */
export function getPrivacyMessage(): string {
  return 'ข้อมูลน้อยเกินไก';
}

/**
 * Get disease name from code.
 */
export function getDiseaseName(code: DiseaseCode): string {
  return DISEASE_CODE_NAMES[code] ?? 'Unknown';
}

/**
 * Check if a disease code is valid.
 */
export function isValidDiseaseCode(code: string): code is DiseaseCode {
  return VALID_CODES.includes(code as DiseaseCode);
}
