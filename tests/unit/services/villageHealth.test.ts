// =============================================================================
// Village Health Population Dashboard - Unit Tests
// =============================================================================

import { describe, it, expect } from 'vitest';
import {
  buildPopulationQuery,
  buildDiseaseQuery,
  buildScreeningQuery,
  buildComorbidityQuery,
} from '@/utils/sqlHelpers';

describe('SQL Query Builders', () => {
  describe('buildPopulationQuery', () => {
    it('should generate valid SQL for population query', () => {
      const sql = buildPopulationQuery('mysql');

      expect(sql).toContain('SELECT');
      expect(sql).toContain('FROM village v');
      expect(sql).toContain('LEFT JOIN house h');
      expect(sql).toContain('LEFT JOIN person p');
    });

    it('should exclude village 0 from regular villages', () => {
      const sql = buildPopulationQuery('mysql');
      expect(sql).toContain("village_moo != '0'");
    });
  });

  describe('buildDiseaseQuery', () => {
    it('should generate valid SQL for disease statistics', () => {
      const sql = buildDiseaseQuery('mysql');

      expect(sql).toContain('SELECT');
      expect(sql).toContain('FROM village v');
      expect(sql).toContain('INNER JOIN clinicmember c');
      expect(sql).toContain("c.clinic IN ('001', '002', '003', '004', '005', '006', '007', '008')");
    });

    it('should only count active patients', () => {
      const sql = buildDiseaseQuery('mysql');
      expect(sql).toContain("c.discharge = 'N'");
      expect(sql).toContain("p.death = 'N'");
    });
  });

  describe('buildScreeningQuery', () => {
    it('should generate valid SQL for screening coverage', () => {
      const sql = buildScreeningQuery('mysql');

      expect(sql).toContain('SELECT');
      expect(sql).toContain('person_dm_screen_status');
      expect(sql).toContain('person_ht_screen_status');
    });

    it('should filter by age 15-59', () => {
      const sql = buildScreeningQuery('mysql');
      expect(sql).toContain('BETWEEN 15 AND 59');
    });
  });

  describe('buildComorbidityQuery', () => {
    it('should generate valid SQL for comorbidity statistics', () => {
      const sql = buildComorbidityQuery('mysql');

      expect(sql).toContain('SELECT');
      expect(sql).toContain('cm_dm_cmbty_screen');
    });

    it('should only include DM and HT patients', () => {
      const sql = buildComorbidityQuery('mysql');
      expect(sql).toContain("cm.clinic IN ('001', '002')");
    });
  });
});
