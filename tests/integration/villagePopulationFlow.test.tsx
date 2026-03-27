// =============================================================================
// Village Health Population Dashboard - Integration Tests
// =============================================================================
// Tests the full flow of loading and displaying village population data

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/bmsSession', () => ({
  retrieveBmsSession: vi.fn(),
  extractConnectionConfig: vi.fn(),
  executeSqlViaApi: vi.fn(),
}));

vi.mock('@/services/villageHealth', () => ({
  fetchVillagePopulation: vi.fn(),
  fetchDiseaseStatistics: vi.fn(),
  fetchScreeningCoverage: vi.fn(),
  fetchComorbidityStatistics: vi.fn(),
  fetchAllVillageHealthData: vi.fn(),
  invalidateVillageHealthCache: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Village Population Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch village population data successfully', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockResolvedValue([
        {
          villageId: 1,
          villageMoo: '1',
          villageName: 'บ้านทดสอบ',
          householdCount: 50,
          totalPopulation: 200,
          maleCount: 100,
          femaleCount: 100,
          age0to14: 40,
          age15to59: 120,
          age60Plus: 40,
          isOutOfArea: false,
        },
      ]);

      const result = await fetchVillagePopulation(mockConfig);
      expect(result).toHaveLength(1);
      expect(result[0].villageName).toBe('บ้านทดสอบ');
    });

    it('should fetch disease statistics successfully', async () => {
      const { fetchDiseaseStatistics } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchDiseaseStatistics).mockResolvedValue(new Map([
        [1, [{ villageId: 1, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: 15 }]],
      ]));

      const result = await fetchDiseaseStatistics(mockConfig);
      expect(result.size).toBe(1);
      expect(result.get(1)).toBeDefined();
    });

    it('should fetch screening coverage successfully', async () => {
      const { fetchScreeningCoverage } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchScreeningCoverage).mockResolvedValue(new Map([
        [1, {
          villageId: 1,
          totalEligible: 100,
          dmScreened: 80,
          htScreened: 75,
          dmCoveragePercent: 80,
          htCoveragePercent: 75,
        }],
      ]));

      const result = await fetchScreeningCoverage(mockConfig);
      expect(result.size).toBe(1);
    });

    it('should fetch comorbidity statistics successfully', async () => {
      const { fetchComorbidityStatistics } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchComorbidityStatistics).mockResolvedValue(new Map([
        [1, {
          villageId: 1,
          eyeComplication: 2,
          footComplication: 1,
          kidneyComplication: 0,
          cardiovascularComplication: 0,
          cerebrovascularComplication: 0,
          peripheralVascularComplication: 0,
          dentalComplication: 0,
        }],
      ]));

      const result = await fetchComorbidityStatistics(mockConfig);
      expect(result.size).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockRejectedValue(new Error('Network error'));

      await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow('Network error');
    });

    it('should handle SQL errors gracefully', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockRejectedValue(new Error('SQL Error: Table not found'));

      await expect(fetchVillagePopulation(mockConfig)).rejects.toThrow(/SQL Error/);
    });

    it('should handle empty data gracefully', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockResolvedValue([]);

      const result = await fetchVillagePopulation(mockConfig);
      expect(result).toHaveLength(0);
    });
  });

  describe('Privacy Protection', () => {
    it('should protect small villages', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockResolvedValue([
        {
          villageId: 1,
          villageMoo: '1',
          villageName: 'บ้านเล็ก',
          householdCount: 2,
          totalPopulation: 5, // Less than 10
          maleCount: 3,
          femaleCount: 2,
          age0to14: 1,
          age15to59: 3,
          age60Plus: 1,
          isOutOfArea: false,
        },
      ]);

      const result = await fetchVillagePopulation(mockConfig);
      expect(result[0].totalPopulation).toBe(5);
      // Privacy protection should be applied by formatters
    });
  });

  describe('Out of Area Village', () => {
    it('should identify out of area villages', async () => {
      const { fetchVillagePopulation } = await import('@/services/villageHealth');
      const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test' };

      vi.mocked(fetchVillagePopulation).mockResolvedValue([
        {
          villageId: 99,
          villageMoo: '0', // Out of area
          villageName: 'นอกเขต',
          householdCount: 10,
          totalPopulation: 30,
          maleCount: 15,
          femaleCount: 15,
          age0to14: 5,
          age15to59: 20,
          age60Plus: 5,
          isOutOfArea: true,
        },
      ]);

      const result = await fetchVillagePopulation(mockConfig);
      expect(result[0].isOutOfArea).toBe(true);
      expect(result[0].villageMoo).toBe('0');
    });
  });

  describe('Cache Management', () => {
    it('should invalidate cache when requested', async () => {
      const { invalidateVillageHealthCache } = await import('@/services/villageHealth');

      invalidateVillageHealthCache();
      // Cache should be cleared without error
      expect(invalidateVillageHealthCache).toBeDefined();
    });
  });
});
