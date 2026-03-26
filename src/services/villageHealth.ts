// =============================================================================
// Village Health Population Dashboard - Data Service
// =============================================================================

import type { ConnectionConfig, DatabaseType, SqlApiResponse } from '@/types';
import type {
  VillageHealthData,
  VillageSummary,
  DiseaseStatistics,
  ComorbidityStatistics,
} from '@/types/villageHealth';
import { executeSqlViaApi } from '@/services/bmsSession';
import {
  buildPopulationQuery,
  buildDiseaseQuery,
  buildScreeningQuery,
  buildComorbidityQuery,
} from '@/utils/sqlHelpers';
import {
  toVillageSummary,
  toDiseaseStatistics,
  mergeScreeningCoverage,
  toComorbidityStatistics,
} from '@/utils/villageDataTransformers';
import {
  validateVillageSummary,
} from '@/utils/villageHealthValidation';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Application identifier for village health queries */
export const VILLAGE_HEALTH_APP = 'BMS.Dashboard.VillageHealth';

/** Cache duration in milliseconds (5 minutes) */
export const CACHE_DURATION_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Cache management
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_DURATION_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function clearCache(): void {
  cache.clear();
}

// ---------------------------------------------------------------------------
// Raw query result types
// ---------------------------------------------------------------------------

interface RawPopulationRow {
  village_id: number;
  village_moo: string;
  village_name: string;
  household_count: number;
  total_population: number;
  male_count: number;
  female_count: number;
  age_0_14: number;
  age_15_59: number;
  age_60_plus: number;
}

 interface RawDiseaseRow {
  village_id: number;
  village_moo: string;
  village_name: string;
  disease_code: string;
  disease_name: string;
  patient_count: number;
}

interface RawScreeningRow {
  village_id: number;
  village_moo: string;
  village_name: string;
  total_eligible: number;
  dm_screened: number;
  ht_screened: number;
  dm_coverage_percent: number | null;
  ht_coverage_percent: number | null;
}

interface RawComorbidityRow {
  village_id: number;
  village_moo: string;
  village_name: string;
  eye_complication: number;
  foot_complication: number;
  kidney_complication: number;
  cardiovascular_complication: number;
  cerebrovascular_complication: number;
  peripheral_vascular_complication: number;
  dental_complication: number;
}

// ---------------------------------------------------------------------------
// Query executor
// ---------------------------------------------------------------------------

/**
 * Execute a SQL query and parse the response.
 */
async function executeQuery<T>(sql: string, config: ConnectionConfig): Promise<T[]> {
  const response: SqlApiResponse = await executeSqlViaApi(sql, config);

  if (response.MessageCode !== 200) {
    throw new Error(
      `SQL API returned HTTP ${response.MessageCode}. Please check the BMS service status and try again.`,
    );
  }

  return (response.data ?? []) as T[];
}

 // ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch village population summary for all villages.
 */
export async function fetchVillagePopulation(
  config: ConnectionConfig,
  dbType: DatabaseType = 'mysql',
): Promise<VillageSummary[]> {
  const cacheKey = `population-${dbType}`;
  const cached = getCached<VillageSummary[]>(cacheKey);
  if (cached) return cached;

  const sql = buildPopulationQuery(dbType);
  const rows = await executeQuery<RawPopulationRow>(sql, config);

  const villages = rows.map((row) => {
    const summary = toVillageSummary(row);
    const validation = validateVillageSummary(summary);
    if (!validation.isValid) {
      console.warn(`Validation warnings for village ${summary.villageId}:`, validation.errors);
    }
    return summary;
  });

  setCache(cacheKey, villages);
  return villages;
}

 /**
 * Fetch chronic disease statistics for all villages.
 */
export async function fetchDiseaseStatistics(
  config: ConnectionConfig,
  dbType: DatabaseType = 'mysql',
): Promise<Map<number, DiseaseStatistics[]>> {
  const cacheKey = `diseases-${dbType}`;
  const cached = getCached<Map<number, DiseaseStatistics[]>>(cacheKey);
  if (cached) return cached;

  const sql = buildDiseaseQuery(dbType);
  const rows = await executeQuery<RawDiseaseRow>(sql, config);

  const diseaseMap = new Map<number, DiseaseStatistics[]>();

  // Group by village
  const villageGroups = new Map<number, RawDiseaseRow[]>();
  for (const row of rows) {
    const villageId = row.village_id;
    if (!villageGroups.has(villageId)) {
      villageGroups.set(villageId, []);
    }
    villageGroups.get(villageId)!.push(row);
  }

  // Transform each group
  for (const [villageId, villageRows] of villageGroups) {
    const diseases = toDiseaseStatistics(villageRows, villageId);
    diseaseMap.set(villageId, diseases);
  }

  setCache(cacheKey, diseaseMap);
  return diseaseMap;
}

 /**
 * Fetch screening coverage for all villages.
 */
export async function fetchScreeningCoverage(
  config: ConnectionConfig,
  dbType: DatabaseType = 'mysql',
): Promise<Map<number, RawScreeningRow>> {
  const cacheKey = `screening-${dbType}`;
  const cached = getCached<Map<number, RawScreeningRow>>(cacheKey);
  if (cached) return cached;

  const sql = buildScreeningQuery(dbType);
  const rows = await executeQuery<RawScreeningRow>(sql, config);

  const screeningMap = new Map<number, RawScreeningRow>();
  for (const row of rows) {
    screeningMap.set(row.village_id, row);
  }

  setCache(cacheKey, screeningMap);
  return screeningMap;
}

 /**
 * Fetch comorbidity statistics for all villages.
 */
export async function fetchComorbidityStatistics(
  config: ConnectionConfig,
  dbType: DatabaseType = 'mysql',
): Promise<Map<number, ComorbidityStatistics>> {
  const cacheKey = `comorbidities-${dbType}`;
  const cached = getCached<Map<number, ComorbidityStatistics>>(cacheKey);
  if (cached) return cached;

  const sql = buildComorbidityQuery(dbType);
  const rows = await executeQuery<RawComorbidityRow>(sql, config);

  const comorbidityMap = new Map<number, ComorbidityStatistics>();
  for (const row of rows) {
    comorbidityMap.set(row.village_id, toComorbidityStatistics(row));
  }

  setCache(cacheKey, comorbidityMap);
  return comorbidityMap;
}

 /**
 * Fetch all village health data in a single call.
 * Aggregates population, disease statistics, screening coverage, and comorbidities.
 */
export async function fetchAllVillageHealthData(
  config: ConnectionConfig,
  dbType: DatabaseType = 'mysql',
): Promise<VillageHealthData[]> {
  // Execute all queries in parallel
  const [villages, diseaseMap, screeningMap, comorbidityMap] = await Promise.all([
    fetchVillagePopulation(config, dbType),
    fetchDiseaseStatistics(config, dbType),
    fetchScreeningCoverage(config, dbType),
    fetchComorbidityStatistics(config, dbType),
  ]);

  // Merge all data
  return villages.map((village) => {
    const diseases = diseaseMap.get(village.villageId) ?? [];
    const screening = screeningMap.get(village.villageId);
    const comorbidities = comorbidityMap.get(village.villageId) ?? null;

    // Merge screening coverage into disease stats
    const diseasesWithScreening = screening
      ? mergeScreeningCoverage(diseases, screening)
      : diseases;

    return {
      village,
      diseases: diseasesWithScreening,
      comorbidities,
    };
  });
}

/**
 * Clear all cached village health data.
 */
export function invalidateVillageHealthCache(): void {
  clearCache();
}

/**
 * Get cache statistics for debugging.
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
