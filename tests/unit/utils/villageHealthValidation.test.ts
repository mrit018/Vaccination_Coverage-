// =============================================================================
// Village Health Population Dashboard - Validation Tests
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  validateVillageSummary,
  validateDiseaseStatistics,
  validateRawVillageResult,
  isSmallVillage,
  PRIVACY_THRESHOLD,
} from '@/utils/villageHealthValidation';
import type { VillageSummary, DiseaseStatistics } from '@/types/villageHealth';

describe('Village Summary Validation', () => {
  const validVillage: VillageSummary = {
    villageId: 1,
    villageMoo: '1',
    villageName: 'บ้านทดใหม',
    householdCount: 45,
    totalPopulation: 187,
    maleCount: 92,
    femaleCount: 95,
    age0to14: 42,
    age15to59: 98,
    age60Plus: 47,
    isOutOfArea: false,
  };

  const validDiseaseStats: DiseaseStatistics[] = [
    {
      villageId: 1,
      diseaseCode: '001',
      diseaseName: 'เบาหวาน',
      patientCount: 23,
      screeningCoverage: 75.5,
      lastScreeningDate: null,
    },
  ];

  describe('validateVillageSummary', () => {
    it('should pass validation for valid village', () => {
      const result = validateVillageSummary(validVillage);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when gender counts do not match sum', () => {
      const invalidVillage: VillageSummary = {
        ...validVillage,
        maleCount: 50,
        femaleCount: 50,
        totalPopulation: 200, // Mismatch: 50 + 50 = 100, not 200
      };

      const result = validateVillageSummary(invalidVillage);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail when age group counts do not match sum', () => {
      const invalidVillage: VillageSummary = {
        ...validVillage,
        age0to14: 50,
        age15to59: 50,
        age60Plus: 50,
        totalPopulation: 200, // Mismatch: 50 + 50 + 50 = 150, not 200
      };

      const result = validateVillageSummary(invalidVillage);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail for negative counts', () => {
      const invalidVillage: VillageSummary = {
        ...validVillage,
        householdCount: -5,
      };

      const result = validateVillageSummary(invalidVillage);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('negative'))).toBe(true);
    });
  });

  describe('validateDiseaseStatistics', () => {
    it('should pass validation for valid disease stats', () => {
      const result = validateDiseaseStatistics(validDiseaseStats);
      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid disease code', () => {
      const invalidStats: DiseaseStatistics[] = [
        {
          villageId: 1,
          diseaseCode: '999' as '001',
          diseaseName: 'Unknown',
          patientCount: 5,
          screeningCoverage: null,
          lastScreeningDate: null,
        },
      ];

      const result = validateDiseaseStatistics(invalidStats);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid disease code'))).toBe(true);
    });

    it('should fail for screening coverage out of range', () => {
      const invalidStats: DiseaseStatistics[] = [
        {
          ...validDiseaseStats[0],
          screeningCoverage: 150,
        },
      ];

      const result = validateDiseaseStatistics(invalidStats);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('0 and 100'))).toBe(true);
    });
  });

  describe('validateRawVillageResult', () => {
    it('should pass for valid raw row', () => {
      const validRow = {
        village_id: 1,
        village_moo: '1',
        village_name: 'บ้านทดใหม',
        household_count: 45,
        total_population: 187,
        male_count: 92,
        female_count: 95,
        age_0_14: 42,
        age_15_59: 98,
        age_60_plus: 47,
      };

      const result = validateRawVillageResult(validRow);
      expect(result.isValid).toBe(true);
    });

    it('should fail for missing required fields', () => {
      const invalidRow = {
        household_count: 45,
      };

      const result = validateRawVillageResult(invalidRow);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('isSmallVillage', () => {
    it('should return true for population below threshold', () => {
      expect(isSmallVillage(5)).toBe(true);
      expect(isSmallVillage(9)).toBe(true);
    });

    it('should return false for population at or above threshold', () => {
      expect(isSmallVillage(10)).toBe(false);
      expect(isSmallVillage(100)).toBe(false);
      expect(isSmallVillage(0)).toBe(false);
    });
  });

  describe('PRIVACY_THRESHOLD', () => {
    it('should be 10', () => {
      expect(PRIVACY_THRESHOLD).toBe(10);
    });
  });
});
