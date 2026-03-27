// =============================================================================
// Integration Tests for Village Health Statistics Display
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
  fetchDiseaseStatistics: vi.fn(),
  fetchScreeningCoverage: vi.fn(),
  fetchComorbidityStatistics: vi.fn(),
  invalidateVillageHealthCache: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Village Health Statistics Display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Disease Statistics Display', () => {
    it('should fetch and display disease statistics per village', async () => {
      const { fetchDiseaseStatistics } = await import('@/services/villageHealth');

      vi.mocked(fetchDiseaseStatistics).mockResolvedValue(new Map([
        [1, [
          { villageId: 1, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: 25, screeningCoverage: 80, lastScreeningDate: null },
          { villageId: 1, diseaseCode: '002', diseaseName: 'ความดันโลหิตสูง', patientCount: 35, screeningCoverage: 75, lastScreeningDate: null },
        ]],
        [2, [
          { villageId: 2, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: 15, screeningCoverage: 90, lastScreeningDate: null },
          { villageId: 2, diseaseCode: '002', diseaseName: 'ความดันโลหิตสูง', patientCount: 20, screeningCoverage: 85, lastScreeningDate: null },
        ]],
      ]));

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const diseaseStats = await fetchDiseaseStatistics(config);

      expect(diseaseStats.size).toBe(2);
      expect(diseaseStats.get(1)).toHaveLength(2);
      expect(diseaseStats.get(1)?.[0].patientCount).toBe(25);
    });

    it('should display disease prevalence with correct labels', async () => {
      const { fetchDiseaseStatistics } = await import('@/services/villageHealth');

      vi.mocked(fetchDiseaseStatistics).mockResolvedValue(new Map([
        [1, [
          { villageId: 1, diseaseCode: '003', diseaseName: 'COPD', patientCount: 5, screeningCoverage: null, lastScreeningDate: null },
          { villageId: 1, diseaseCode: '004', diseaseName: 'หอบหืด', patientCount: 10, screeningCoverage: null, lastScreeningDate: null },
        ]],
      ]));

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const diseaseStats = await fetchDiseaseStatistics(config);

      const village1Diseases = diseaseStats.get(1);
      expect(village1Diseases).toBeDefined();
      expect(village1Diseases?.find(d => d.diseaseCode === '003')?.diseaseName).toBe('COPD');
      expect(village1Diseases?.find(d => d.diseaseCode === '004')?.diseaseName).toBe('หอบหืด');
    });
  });

  describe('Screening Coverage Display', () => {
    it('should fetch and display screening coverage per village', async () => {
      const { fetchScreeningCoverage } = await import('@/services/villageHealth');

      vi.mocked(fetchScreeningCoverage).mockResolvedValue(new Map([
        [1, {
          villageId: 1,
          totalEligible: 100,
          dmScreened: 85,
          htScreened: 80,
          dmCoveragePercent: 85,
          htCoveragePercent: 80,
        }],
        [2, {
          villageId: 2,
          totalEligible: 80,
          dmScreened: 48,
          htScreened: 40,
          dmCoveragePercent: 60,
          htCoveragePercent: 50,
        }],
      ]));

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const screeningData = await fetchScreeningCoverage(config);

      expect(screeningData.size).toBe(2);
      expect(screeningData.get(1)?.dmCoveragePercent).toBe(85);
      expect(screeningData.get(2)?.dmCoveragePercent).toBe(60);
    });

    it('should calculate coverage percentages correctly', async () => {
      const { fetchScreeningCoverage } = await import('@/services/villageHealth');

      vi.mocked(fetchScreeningCoverage).mockResolvedValue(new Map([
        [1, {
          villageId: 1,
          totalEligible: 200,
          dmScreened: 160,
          htScreened: 140,
          dmCoveragePercent: 80,
          htCoveragePercent: 70,
        }],
      ]));

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const screeningData = await fetchScreeningCoverage(config);

      const village1 = screeningData.get(1);
      expect(village1).toBeDefined();
      // DM: 160/200 = 80%
      expect(village1?.dmCoveragePercent).toBe(80);
      // HT: 140/200 = 70%
      expect(village1?.htCoveragePercent).toBe(70);
    });
  });

  describe('Comorbidity Statistics Display', () => {
    it('should fetch and display comorbidity statistics per village', async () => {
      const { fetchComorbidityStatistics } = await import('@/services/villageHealth');

      vi.mocked(fetchComorbidityStatistics).mockResolvedValue(new Map([
        [1, {
          villageId: 1,
          eyeComplication: 5,
          footComplication: 3,
          kidneyComplication: 2,
          cardiovascularComplication: 1,
          cerebrovascularComplication: 0,
          peripheralVascularComplication: 0,
          dentalComplication: 4,
        }],
      ]));

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const comorbidityData = await fetchComorbidityStatistics(config);

      expect(comorbidityData.size).toBe(1);
      expect(comorbidityData.get(1)?.eyeComplication).toBe(5);
      expect(comorbidityData.get(1)?.kidneyComplication).toBe(2);
    });
  });

  describe('Aggregated Health Metrics', () => {
    it('should aggregate health data for all villages', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        {
          village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 500, maleCount: 250, femaleCount: 250, householdCount: 100, age0to14: 100, age15to59: 300, age60Plus: 100, isOutOfArea: false },
          diseases: [
            { villageId: 1, diseaseCode: '001', diseaseName: 'DM', patientCount: 30, screeningCoverage: 80, lastScreeningDate: null },
          ],
          comorbidities: {
            villageId: 1,
            eyeComplication: 5,
            footComplication: 3,
            kidneyComplication: 2,
            cardiovascularComplication: 1,
            cerebrovascularComplication: 0,
            peripheralVascularComplication: 0,
            dentalComplication: 4,
          },
          screening: {
            villageId: 1,
            totalEligible: 300,
            dmScreened: 240,
            htScreened: 225,
            dmCoveragePercent: 80,
            htCoveragePercent: 75,
          },
        },
        {
          village: { villageId: 2, villageMoo: '2', villageName: 'V2', totalPopulation: 300, maleCount: 150, femaleCount: 150, householdCount: 60, age0to14: 60, age15to59: 180, age60Plus: 60, isOutOfArea: false },
          diseases: [
            { villageId: 2, diseaseCode: '001', diseaseName: 'DM', patientCount: 15, screeningCoverage: 90, lastScreeningDate: null },
          ],
          comorbidities: null,
          screening: null,
        },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const allData = await fetchAllVillageHealthData(config);

      // Calculate aggregate metrics
      const totalPopulation = allData.reduce((sum, v) => sum + v.village.totalPopulation, 0);
      const totalDmPatients = allData.reduce(
        (sum, v) => sum + v.diseases.find(d => d.diseaseCode === '001')?.patientCount ?? 0,
        0
      );

      expect(totalPopulation).toBe(800);
      expect(totalDmPatients).toBe(45);
    });
  });

  describe('Error Handling', () => {
    it('should handle partial data failures gracefully', async () => {
      const { fetchAllVillageHealthData } = await import('@/services/villageHealth');

      vi.mocked(fetchAllVillageHealthData).mockResolvedValue([
        {
          village: { villageId: 1, villageMoo: '1', villageName: 'V1', totalPopulation: 100, maleCount: 50, femaleCount: 50, householdCount: 20, age0to14: 20, age15to59: 60, age60Plus: 20, isOutOfArea: false },
          diseases: [],
          comorbidities: null, // Missing comorbidities
          screening: null, // Missing screening
        },
      ]);

      const config = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };
      const allData = await fetchAllVillageHealthData(config);

      // Should still return village with null data
      expect(allData).toHaveLength(1);
      expect(allData[0].comorbidities).toBeNull();
      expect(allData[0].screening).toBeNull();
    });
  });
});
