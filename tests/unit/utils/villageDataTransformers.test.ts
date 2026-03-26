// =============================================================================
// Village Health Population Dashboard - Data Transformer Tests
// =============================================================================

import { describe, it, expect } from 'vitest';
import type { DiseaseCode } from '@/types/villageHealth';
import {
  toVillageSummary,
  toDiseaseStatistics,
  toComorbidityStatistics,
} from '@/utils/villageDataTransformers';
import type {
  VillageSummary,
  DiseaseStatistics,
  ComorbidityStatistics,
} from '@/types/villageHealth';

describe('Data Transformers', () => {
  describe('toVillageSummary', () => {
    it('should transform raw row to VillageSummary', () => {
      const rawRow = {
        village_id: 1,
        village_moo: '5',
        village_name: 'บ้านทดใหม่',
        household_count: 45,
        total_population: 187,
        male_count: 92,
        female_count: 95,
        age_0_14: 42,
        age_15_59: 98,
        age_60_plus: 47,
      };

      const result = toVillageSummary(rawRow);

      expect(result).toEqual({
        villageId: 1,
        villageMoo: '5',
        villageName: 'บ้านทดใหม่',
        householdCount: 45,
        totalPopulation: 187,
        maleCount: 92,
        femaleCount: 95,
        age0to14: 42,
        age15to59: 98,
        age60Plus: 47,
        isOutOfArea: false,
      });
    });

    it('should mark village moo 0 as out of area', () => {
      const rawRow = {
        village_id: 0,
        village_moo: '0',
        village_name: 'นอกเขต',
        household_count: 10,
        total_population: 15,
        male_count: 8,
        female_count: 7,
        age_0_14: 3,
        age_15_59: 8,
        age_60_plus: 4,
      };

      const result = toVillageSummary(rawRow);

      expect(result.isOutOfArea).toBe(true);
    });

    it('should apply privacy protection for small villages', () => {
      const rawRow = {
        village_id: 2,
        village_moo: '3',
        village_name: 'บ้านเล็ก',
        household_count: 3,
        total_population: 7,
        male_count: 3,
        female_count: 4,
        age_0_14: 2,
        age_15_59: 3,
        age_60_plus: 2,
      };

      const result = toVillageSummary(rawRow);

      // Small village: counts should be zeroed for privacy
      expect(result.householdCount).toBe(00);
      expect(result.maleCount).toBe(0);
      expect(result.femaleCount).toBe(0 );
    });
  });

  describe('toDiseaseStatistics', () => {
    it('should transform raw rows into DiseaseStatistics array', () => {
      const rawRows = [
        {
          village_id: 1,
          disease_code: '001',
          disease_name: 'เบาหวาน',
          patient_count: 23,
        },
        {
          village_id: 1,
          disease_code: '002',
          disease_name: 'ความดันโลหิตสูง',
          patient_count: 31,
        },
      ];

      const result = toDiseaseStatistics(rawRows, 1);

      expect(result).toHaveLength(8); // All 8 disease types
      expect(result[0].diseaseCode).toBe('001');
      expect(result[0].patientCount).toBe(23);
      expect(result[1].diseaseCode).toBe('002');
      expect(result[1].patientCount).toBe(31);
      // Missing diseases should have 0 patient count
      const dmDisease = result.find((d) => d.diseaseCode === '001');
      expect(dmDisease?.diseaseName).toBe('เบาหวาน');
    });

    it('should fill missing disease codes with defaults', () => {
      const rawRows = [
        {
          village_id: 1,
          disease_code: '001',
          disease_name: 'เบาหวาน',
          patient_count: 5,
        },
      ];

      const result = toDiseaseStatistics(rawRows, 1);

      // Should have all 8 disease codes
      expect(result).toHaveLength(8);
      // Missing diseases should have 0 count
      const asthma = result.find((d) => d.diseaseCode === '004');
      expect(asthma?.patientCount).toBe(0);
    });
  });

  describe('toComorbidityStatistics', () => {
    it('should transform raw row to ComorbidityStatistics', () => {
      const rawRow = {
        village_id: 1,
        eye_complication: 5,
        foot_complication: 3,
        kidney_complication: 7,
        cardiovascular_complication: 4,
        cerebrovascular_complication: 2,
        peripheral_vascular_complication: 1,
        dental_complication: 6,
      };

      const result = toComorbidityStatistics(rawRow);

      expect(result).toEqual({
        villageId: 1,
        eyeComplication: 5,
        footComplication: 3,
        kidneyComplication: 7,
        cardiovascularComplication: 4,
        cerebrovascularComplication: 2,
        peripheralVascularComplication: 1,
        dentalComplication: 6,
      });
    });
  });
});
