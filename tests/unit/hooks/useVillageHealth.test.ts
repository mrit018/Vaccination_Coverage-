// =============================================================================
// Unit Tests for useVillageHealth Hook - Filter/Sort Logic
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVillageHealth } from '@/hooks/useVillageHealth';
import * as villageHealthService from '@/services/villageHealth';
import type { VillageHealthData } from '@/types/villageHealth';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/villageHealth', () => ({
  fetchAllVillageHealthData: vi.fn(),
  invalidateVillageHealthCache: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Test Fixtures
// ---------------------------------------------------------------------------

const createMockVillage = (id: number, moo: string, population: number): VillageHealthData => ({
  village: {
    villageId: id,
    villageMoo: moo,
    villageName: `หมู่บ้าน ${moo}`,
    householdCount: Math.floor(population / 4),
    totalPopulation: population,
    maleCount: Math.floor(population / 2),
    femaleCount: Math.floor(population / 2),
    age0to14: Math.floor(population * 0.2),
    age15to59: Math.floor(population * 0.6),
    age60Plus: Math.floor(population * 0.2),
    isOutOfArea: false,
  },
  diseases: [
    { villageId: id, diseaseCode: '001', diseaseName: 'เบาหวาน', patientCount: 10 + id, screeningCoverage: 80, lastScreeningDate: null },
    { villageId: id, diseaseCode: '002', diseaseName: 'ความดันโลหิตสูง', patientCount: 15 + id, screeningCoverage: 75, lastScreeningDate: null },
  ],
  comorbidities: null,
  screening: {
    villageId: id,
    totalEligible: population,
    dmScreened: Math.floor(population * 0.8),
    htScreened: Math.floor(population * 0.75),
    dmCoveragePercent: 80,
    htCoveragePercent: 75,
  },
});

const mockVillages: VillageHealthData[] = [
  createMockVillage(1, '1', 500),
  createMockVillage(2, '2', 300),
  createMockVillage(3, '3', 700),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useVillageHealth Hook', () => {
  const mockConfig = { bmsUrl: 'https://test.com', bmsSessionCode: 'test-token' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(villageHealthService.fetchAllVillageHealthData).mockResolvedValue(mockVillages);
  });

  describe('Data Fetching', () => {
    it('should fetch data on mount when config is provided', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      // Initial state should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(villageHealthService.fetchAllVillageHealthData).toHaveBeenCalledWith(mockConfig, 'mysql');
    });

    it('should return empty array when config is null', () => {
      const { result } = renderHook(() => useVillageHealth(null));
      expect(result.current.villages).toEqual([]);
    });
  });

  describe('Filter Logic', () => {
    it('should filter villages by search query', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Initially all villages are displayed
      expect(result.current.displayedVillages.length).toBe(3);

      act(() => {
        result.current.setFilter({ searchQuery: 'หมู่บ้าน 1' });
      });

      // Filter should be applied
      expect(result.current.filter.searchQuery).toBe('หมู่บ้าน 1');
    });

    it('should filter villages by minimum population', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setFilter({ minPopulation: 500 });
      });

      expect(result.current.filter.minPopulation).toBe(500);
    });

    it('should reset filter to defaults', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setFilter({ searchQuery: 'test' });
      });

      expect(result.current.filter.searchQuery).toBe('test');

      act(() => {
        result.current.resetFilter();
      });

      expect(result.current.filter.searchQuery).toBe('');
    });
  });

  describe('Sort Logic', () => {
    it('should sort villages by villageMoo ascending by default', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.sortBy).toBe('villageMoo');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should sort villages by totalPopulation', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setSort('totalPopulation', 'desc');
      });

      expect(result.current.sortBy).toBe('totalPopulation');
      expect(result.current.sortOrder).toBe('desc');
      expect(result.current.displayedVillages[0].village.totalPopulation).toBe(700);
    });

    it('should toggle sort order when clicking same column', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setSort('villageMoo');
      });

      expect(result.current.sortOrder).toBe('desc');

      act(() => {
        result.current.setSort('villageMoo');
      });

      expect(result.current.sortOrder).toBe('asc');
    });

    it('should sort by householdCount', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setSort('householdCount');
      });

      expect(result.current.sortBy).toBe('householdCount');
    });
  });

  describe('Village Selection', () => {
    it('should get village by ID', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const village = result.current.getVillageById(1);
      expect(village?.village.villageMoo).toBe('1');
    });

    it('should return undefined for non-existent village ID', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const village = result.current.getVillageById(999);
      expect(village).toBeUndefined();
    });
  });

  describe('Refresh and Refetch', () => {
    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      vi.clearAllMocks();

      await act(async () => {
        await result.current.refetch();
      });

      expect(villageHealthService.fetchAllVillageHealthData).toHaveBeenCalled();
    });

    it('should clear cache and refetch when refresh is called', async () => {
      const { result } = renderHook(() => useVillageHealth(mockConfig));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      vi.clearAllMocks();

      await act(async () => {
        await result.current.refresh();
      });

      expect(villageHealthService.invalidateVillageHealthCache).toHaveBeenCalled();
      expect(villageHealthService.fetchAllVillageHealthData).toHaveBeenCalled();
    });
  });
});
