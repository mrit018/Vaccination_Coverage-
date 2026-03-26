// =============================================================================
// Village Health Population Dashboard - React Hook
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { DatabaseType, ConnectionConfig } from '@/types';
import type {
  VillageHealthData,
  VillageFilter,
  SortKey,
  DataLoadingState,
  DiseaseCode,
} from '@/types/villageHealth';
import {
  fetchAllVillageHealthData,
  invalidateVillageHealthCache,
} from '@/services/villageHealth';

// ---------------------------------------------------------------------------
// Default filter state
// ---------------------------------------------------------------------------

const DEFAULT_FILTER: VillageFilter = {
  searchQuery: '',
  minPopulation: null,
  diseaseCodes: [],
  minScreeningCoverage: null,
};

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseVillageHealthResult {
  /** Current loading state */
  dataState: DataLoadingState;
  /** All village health data */
  villages: VillageHealthData[];
  /** Filtered and sorted villages for display */
  displayedVillages: VillageHealthData[];
  /** Current filter settings */
  filter: VillageFilter;
  /** Current sort column */
  sortBy: SortKey;
  /** Current sort direction */
  sortOrder: 'asc' | 'desc';
  /** Error if loading failed */
  error: Error | null;
  /** Loading indicator */
  isLoading: boolean;
  /** Refetch data from server */
  refetch: () => Promise<void>;
  /** Clear cache and refetch */
  refresh: () => Promise<void>;
  /** Update filter settings */
  setFilter: (filter: Partial<VillageFilter>) => void;
  /** Reset filter to defaults */
  resetFilter: () => void;
  /** Update sort settings */
  setSort: (sortBy: SortKey, sortOrder?: 'asc' | 'desc') => void;
  /** Get a single village by ID */
  getVillageById: (id: number) => VillageHealthData | undefined;
}

// ---------------------------------------------------------------------------
// Filtering logic
// ---------------------------------------------------------------------------

function applyFilter(
  villages: VillageHealthData[],
  filter: VillageFilter,
): VillageHealthData[] {
  let result = villages;

  // Search query filter
  if (filter.searchQuery.trim()) {
    const query = filter.searchQuery.toLowerCase().trim();
    result = result.filter((v) => {
      const village = v.village;
      return (
        village.villageName.toLowerCase().includes(query) ||
        village.villageMoo.includes(query)
      );
    });
  }

  // Minimum population filter
  if (filter.minPopulation !== null && filter.minPopulation > 0) {
    result = result.filter((v) => v.village.totalPopulation >= filter.minPopulation!);
  }

  // Disease code filter
  if (filter.diseaseCodes.length > 0) {
    result = result.filter((v) => {
      return filter.diseaseCodes.some((code) => {
        const disease = v.diseases.find((d) => d.diseaseCode === code);
        return disease && disease.patientCount > 0;
      });
    });
  }

  // Minimum screening coverage filter
  if (filter.minScreeningCoverage !== null && filter.minScreeningCoverage > 0) {
    result = result.filter((v) => {
      const dmDisease = v.diseases.find((d) => d.diseaseCode === '001');
      const htDisease = v.diseases.find((d) => d.diseaseCode === '002');
      const dmCoverage = dmDisease?.screeningCoverage ?? 0;
      const htCoverage = htDisease?.screeningCoverage ?? 0;
      return dmCoverage >= filter.minScreeningCoverage! || htCoverage >= filter.minScreeningCoverage!;
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Sorting logic
// ---------------------------------------------------------------------------

function applySort(
  villages: VillageHealthData[],
  sortBy: SortKey,
  sortOrder: 'asc' | 'desc',
): VillageHealthData[] {
  const sorted = [...villages].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'villageMoo': {
        const aMoo = parseInt(a.village.villageMoo, 10) || 999;
        const bMoo = parseInt(b.village.villageMoo, 10) || 999;
        comparison = aMoo - bMoo;
        break;
      }
      case 'totalPopulation':
        comparison = a.village.totalPopulation - b.village.totalPopulation;
        break;
      case 'householdCount':
        comparison = a.village.householdCount - b.village.householdCount;
        break;
      case 'diseaseCount': {
        const aTotal = a.diseases.reduce((sum, d) => sum + d.patientCount, 0);
        const bTotal = b.diseases.reduce((sum, d) => sum + d.patientCount, 0);
        comparison = aTotal - bTotal;
        break;
      }
      case 'screeningCoverage': {
        const aDm = a.diseases.find((d) => d.diseaseCode === '001');
        const bDm = b.diseases.find((d) => d.diseaseCode === '001');
        comparison = (aDm?.screeningCoverage ?? 0) - (bDm?.screeningCoverage ?? 0);
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

// ---------------------------------------------------------------------------
// Main hook
// ---------------------------------------------------------------------------

/**
 * React hook for fetching and managing village health data.
 *
 * @param config - BMS Session connection config
 * @param dbType - Database type for query adaptation
 * @returns Village health state and actions
 */
export function useVillageHealth(
  config: ConnectionConfig | null,
  dbType: DatabaseType = 'mysql',
): UseVillageHealthResult {
  const [dataState, setDataState] = useState<DataLoadingState>('IDLE');
  const [villages, setVillages] = useState<VillageHealthData[]>([]);
  const [filter, setFilterState] = useState<VillageFilter>(DEFAULT_FILTER);
  const [sortBy, setSortBy] = useState<SortKey>('villageMoo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<Error | null>(null);

  // Fetch data
  const fetchData = useCallback(async (clearCache: boolean = false) => {
    if (!config) {
      setDataState('IDLE');
      setVillages([]);
      return;
    }

    setDataState('LOADING');
    setError(null);

    try {
      if (clearCache) {
        invalidateVillageHealthCache();
      }

      const data = await fetchAllVillageHealthData(config, dbType);
      setVillages(data);
      setDataState('SUCCESS');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setDataState('ERROR');
      console.error('Failed to fetch village health data:', error);
    }
  }, [config, dbType]);

  // Initial fetch when config changes
  useEffect(() => {
    if (config) {
      fetchData(false);
    }
  }, [config, fetchData]);

  // Filter and sort for display
  const displayedVillages = useMemo(() => {
    const filtered = applyFilter(villages, filter);
    return applySort(filtered, sortBy, sortOrder);
  }, [villages, filter, sortBy, sortOrder]);

  // Actions
  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const setFilter = useCallback((updates: Partial<VillageFilter>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  const setSort = useCallback((newSortBy: SortKey, newSortOrder?: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    if (newSortOrder) {
      setSortOrder(newSortOrder);
    } else if (newSortBy === sortBy) {
      // Toggle order if clicking same column
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Default to ascending for new column
      setSortOrder('asc');
    }
  }, [sortBy]);

  const getVillageById = useCallback((id: number) => {
    return villages.find((v) => v.village.villageId === id);
  }, [villages]);

  return {
    dataState,
    villages,
    displayedVillages,
    filter,
    sortBy,
    sortOrder,
    error,
    isLoading: dataState === 'LOADING',
    refetch,
    refresh,
    setFilter,
    resetFilter,
    setSort,
    getVillageById,
  };
}
