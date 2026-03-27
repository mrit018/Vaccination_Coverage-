// =============================================================================
// Village Health Population Dashboard - API Contract Tests
// =============================================================================
// Tests that verify SQL queries are valid and return expected data shapes

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  buildPopulationQuery,
  buildDiseaseQuery,
  buildScreeningQuery,
  buildComorbidityQuery,
} from '@/utils/sqlHelpers';

describe('Village Health API Contract Tests', () => {
  describe('Population Query Contract', () => {
    it('should return valid SQL syntax for MySQL', () => {
      const sql = buildPopulationQuery('mysql');

      // Verify basic SQL structure
      expect(sql).toMatch(/^SELECT/i);
      expect(sql).toContain('FROM village');
      expect(sql).toContain('LEFT JOIN house');
      expect(sql).toContain('LEFT JOIN person');
      expect(sql).toContain('GROUP BY');
    });

    it('should return valid SQL syntax for PostgreSQL', () => {
      const sql = buildPopulationQuery('postgresql');

      // PostgreSQL uses single quotes for strings
      expect(sql).toContain("'0'");
      expect(sql).not.toContain('"0"');
    });

    it('should include required columns in population query', () => {
      const sql = buildPopulationQuery('mysql');

      const requiredColumns = [
        'village_id',
        'village_moo',
        'village_name',
        'household_count',
        'total_population',
        'male_count',
        'female_count',
        'age_0_14',
        'age_15_59',
        'age_60_plus',
      ];

      for (const col of requiredColumns) {
        expect(sql).toContain(col);
      }
    });

    it('should filter out death patients', () => {
      const sql = buildPopulationQuery('mysql');
      expect(sql).toContain("p.death = 'N'");
    });

    it('should exclude village moo 0 from regular results', () => {
      const sql = buildPopulationQuery('mysql');
      expect(sql).toContain("village_moo != '0'");
    });
  });

  describe('Disease Query Contract', () => {
    it('should return valid SQL for disease statistics', () => {
      const sql = buildDiseaseQuery('mysql');

      expect(sql).toMatch(/^SELECT/i);
      expect(sql).toContain('FROM village');
      expect(sql).toContain('INNER JOIN clinicmember');
      expect(sql).toContain('INNER JOIN clinic');
      expect(sql).toContain('GROUP BY');
    });

    it('should include all 8 disease codes', () => {
      const sql = buildDiseaseQuery('mysql');

      const diseaseCodes = ['001', '002', '003', '004', '005', '006', '007', '008'];
      for (const code of diseaseCodes) {
        expect(sql).toContain(`'${code}'`);
      }
    });

    it('should only count active patients', () => {
      const sql = buildDiseaseQuery('mysql');
      expect(sql).toContain("c.discharge = 'N'");
      expect(sql).toContain("p.death = 'N'");
    });

    it('should return required columns', () => {
      const sql = buildDiseaseQuery('mysql');

      expect(sql).toContain('village_id');
      expect(sql).toContain('village_moo');
      expect(sql).toContain('village_name');
      expect(sql).toContain('disease_code');
      expect(sql).toContain('disease_name');
      expect(sql).toContain('patient_count');
    });
  });

  describe('Screening Query Contract', () => {
    it('should return valid SQL for screening coverage', () => {
      const sql = buildScreeningQuery('mysql');

      expect(sql).toMatch(/^SELECT/i);
      expect(sql).toContain('person_dm_screen_status');
      expect(sql).toContain('person_ht_screen_status');
    });

    it('should filter by eligible age range (15-59)', () => {
      const sql = buildScreeningQuery('mysql');
      expect(sql).toContain('BETWEEN 15 AND 59');
    });

    it('should calculate coverage percentages', () => {
      const sql = buildScreeningQuery('mysql');

      expect(sql).toContain('dm_screened');
      expect(sql).toContain('ht_screened');
      expect(sql).toContain('dm_coverage_percent');
      expect(sql).toContain('ht_coverage_percent');
    });
  });

  describe('Comorbidity Query Contract', () => {
    it('should return valid SQL for comorbidity statistics', () => {
      const sql = buildComorbidityQuery('mysql');

      expect(sql).toMatch(/^SELECT/i);
      expect(sql).toContain('cm_dm_cmbty_screen');
    });

    it('should only include DM and HT patients', () => {
      const sql = buildComorbidityQuery('mysql');
      expect(sql).toContain("cm.clinic IN ('001', '002')");
    });

    it('should include all comorbidity columns', () => {
      const sql = buildComorbidityQuery('mysql');

      const comorbidities = [
        'has_eye_cormobidity',
        'has_foot_cormobidity',
        'has_kidney_cormobidity',
        'has_cardiovascular_cormobidity',
        'has_cerebrovascular_cormobidity',
        'has_peripheralvascular_cormobidity',
        'has_dental_cormobidity',
      ];

      for (const col of comorbidities) {
        expect(sql).toContain(col);
      }
    });
  });

  describe('Query Performance Constraints', () => {
    it('should use LIMIT clause in queries', () => {
      const popSql = buildPopulationQuery('mysql');
      const diseaseSql = buildDiseaseQuery('mysql');

      // Queries should have reasonable limits for performance
      expect(popSql).toContain('LIMIT');
      expect(diseaseSql).toContain('LIMIT');
    });

    it('should not exceed 20 tables per query', () => {
      const queries = [
        buildPopulationQuery('mysql'),
        buildDiseaseQuery('mysql'),
        buildScreeningQuery('mysql'),
        buildComorbidityQuery('mysql'),
      ];

      for (const sql of queries) {
        const joinCount = (sql.match(/JOIN/gi) || []).length;
        expect(joinCount).toBeLessThan(20);
      }
    });
  });
});
