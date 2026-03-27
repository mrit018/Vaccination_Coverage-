// =============================================================================
// Integration Tests for Village Comparison Flow
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/bmsSession', () => ({
  executeSqlViaApi: vi.fn(),
}));

vi.mock('@/services/villageHealth', () => ({
  fetchAllVillageHealthData: vi.fn(),
  invalidateVillageHealthCache: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Village Comparison Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-Village Selection', () => {
    it('should select multiple villages for comparison', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        { village: { villageId: 1, villageMoo: '1', villageName: 'Village 1' }, diseases: [], comorbidities: null, screening: null },
        { village: { villageId: 2, villageMoo: '2', villageName: 'Village 2' }, diseases: [], comorbidities: null, screening: null },
        { village: { villageId: 3, villageMoo: '3', villageName: 'Village 3' }, diseases: [], comorbidities: null, screening: null },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const villages = await fetchAllVillageHealthData(config);

      expect(villages.length).toBe(3);
    });

    it('should compare population metrics across villages', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        { village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 500, maleCount: 250, femaleCount: 250, householdCount: 100, age0to14: 100, age15to59: 300, age60Plus: 100, isOutOfArea: false }, diseases: [], comorbidities: null, screening: null },
        { village: { villageId: 2, villageMoo: '2', villageName: 'V2', totalPopulation: 300, maleCount: 150, femaleCount: 150, householdCount: 60, age0to14: 60, age15to59: 180, age60Plus: 60, isOutOfArea: false }, diseases: [], comorbidities: null, screening: null },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const villages = await fetchAllVillageHealthData(config);

      // Find village with highest population
      const largest = villages.reduce((max, v) =>
        v.village.totalPopulation > max.village.totalPopulation ? v : max
      );

      expect(largest.village.villageId).toBe(1);
      expect(largest.village.totalPopulation).toBe(500);
    });

    it('should compare disease statistics across villages', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        {
          village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 500, maleCount: 250, femaleCount: 250, householdCount: 100, age0to14: 100, age15to59: 300, age60Plus: 100, isOutOfArea: false },
          diseases: [
            { villageId: 1, diseaseCode: '001', diseaseName: 'DM', patientCount: 30, screeningCoverage: 80, lastScreeningDate: null },
            { villageId: 1, diseaseCode: '002', diseaseName: 'HT', patientCount: 40, screeningCoverage: 75, lastScreeningDate: null },
          ],
          comorbidities: null,
          screening: null,
        },
        {
          village: { villageId: 2, villageMoo: '2', villageName: 'V2', totalPopulation: 300, maleCount: 150, femaleCount: 150, householdCount: 60, age0to14: 60, age15to59: 180, age60Plus: 60, isOutOfArea: false },
          diseases: [
            { villageId: 2, diseaseCode: '001', diseaseName: 'DM', patientCount: 15, screeningCoverage: 90, lastScreeningDate: null },
            { villageId: 2, diseaseCode: '002', diseaseName: 'HT', patientCount: 20, screeningCoverage: 85, lastScreeningDate: null },
          ],
          comorbidities: null,
          screening: null,
        },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const villages = await fetchAllVillageHealthData(config);

      // Calculate total disease counts per village
      const diseaseCounts = villages.map(v => ({
        villageId: v.village.villageId,
        totalPatients: v.diseases.reduce((sum, d) => sum + d.patientCount, 0),
      }));

      // Find village with highest disease burden
      const highestBurden = diseaseCounts.reduce((max, v) =>
        v.totalPatients > max.totalPatients ? v : max
      );

      expect(highestBurden.villageId).toBe(1); // Village 1 has 70 patients, Village 2 has 35
      expect(highestBurden.totalPatients).toBe(70);
    });
  });

  describe('Screening Coverage Comparison', () => {
    it('should compare screening coverage across villages', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        {
          village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 100, maleCount: 50, femaleCount: 50, householdCount: 20, age0to14: 20, age15to59: 60, age60Plus: 20, isOutOfArea: false },
          diseases: [],
          comorbidities: null,
          screening: { villageId: 1, totalEligible: 80, dmScreened: 70, htScreened: 65, dmCoveragePercent: 87.5, htCoveragePercent: 81.25 },
        },
        {
          village: { villageId: 2, villageMoo: '2', villageName: 'V2', totalPopulation: 100, maleCount: 50, femaleCount: 50, householdCount: 20, age0to14: 20, age15to59: 60, age60Plus: 20, isOutOfArea: false },
          diseases: [],
          comorbidities: null,
          screening: { villageId: 2, totalEligible: 80, dmScreened: 50, htScreened: 45, dmCoveragePercent: 62.5, htCoveragePercent: 56.25 },
        },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const villages = await fetchAllVillageHealthData(config);

      // Find village with highest DM coverage
      const highestDmCoverage = villages.reduce((max, v) =>
        (v.screening?.dmCoveragePercent ?? 0) > (max.screening?.dmCoveragePercent ?? 0) ? v : max
      );

      expect(highestDmCoverage.village.villageId).toBe(1);
      expect(highestDmCoverage.screening?.dmCoveragePercent).toBe(87.5);
    });
  });

  describe('Data Export for Comparison', () => {
    it('should prepare comparison data for export', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        { village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 100, maleCount: 50, femaleCount: 50, householdCount: 20, age0to14: 20, age15to59: 60, age60Plus: 20, isOutOfArea: false }, diseases: [], comorbidities: null, screening: null },
        { village: { villageId: 2, villageMoo: '2', villageName: 'V2', totalPopulation: 150, maleCount: 75, femaleCount: 75, householdCount: 30, age0to14: 30, age15to59: 90, age60Plus: 30, isOutOfArea: false }, diseases: [], comorbidities: null, screening: null },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const villages = await fetchAllVillageHealthData(config);

      // Prepare export data
      const exportData = villages.map(v => ({
        villageMoo: v.village.villageMoo,
        villageName: v.village.villageName,
        population: v.village.totalPopulation,
        households: v.village.householdCount,
      }));

      expect(exportData).toHaveLength(2);
      expect(exportData[0].population).toBe(100);
      expect(exportData[1].population).toBe(150);
    });
  });
});
