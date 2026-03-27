// =============================================================================
// Village Health Population Dashboard - Data Service
// =============================================================================

import type { ConnectionConfig, DatabaseType, SqlApiResponse } from '@/types';
import type {
  VillageHealthData,
  VillageSummary,
  DiseaseStatistics,
  ComorbidityStatistics,
  ScreeningCoverage,
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
// Error Logging (T054)
// ---------------------------------------------------------------------------

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Structured logging for village health data operations
 */
function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    component: 'VillageHealthService',
    message,
    ...(data && { data }),
  };

  switch (level) {
    case 'error':
      console.error(JSON.stringify(entry));
      break;
    case 'warn':
      console.warn(JSON.stringify(entry));
      break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') {
        console.debug(JSON.stringify(entry));
      }
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

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
// Transformer functions
// ---------------------------------------------------------------------------

/**
 * Transform raw screening row to ScreeningCoverage type
 */
function toScreeningCoverage(row: RawScreeningRow): ScreeningCoverage {
  return {
    villageId: row.village_id,
    totalEligible: row.total_eligible ?? 0,
    dmScreened: row.dm_screened ?? 0,
    htScreened: row.ht_screened ?? 0,
    dmCoveragePercent: row.dm_coverage_percent ?? 0,
    htCoveragePercent: row.ht_coverage_percent ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Query executor
// ---------------------------------------------------------------------------

/**
 * Execute a SQL query and parse the response.
 * Includes comprehensive error logging (T054).
 */
async function executeQuery<T>(sql: string, config: ConnectionConfig): Promise<T[]> {
  log('debug', 'Executing SQL query', { sqlPreview: sql.substring(0, 100) + '...' });

  try {
    const response: SqlApiResponse = await executeSqlViaApi(sql, config);

    if (response.MessageCode !== 200) {
      log('error', 'SQL API returned error', {
        messageCode: response.MessageCode,
        message: response.Message,
      });
      throw new Error(
        `SQL API returned HTTP ${response.MessageCode}. Please check the BMS service status and try again.`,
      );
    }

    const rowCount = response.data?.length ?? 0;
    log('info', 'SQL query completed', { rowCount });

    return (response.data ?? []) as T[];
  } catch (error) {
    log('error', 'SQL query execution failed', {
      error: error instanceof Error ? error.message : String(error),
      sqlPreview: sql.substring(0, 100),
    });
    throw error;
  }
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
  log('info', 'Fetching village population data', { dbType });

  const cacheKey = `population-${dbType}`;
  const cached = getCached<VillageSummary[]>(cacheKey);
  if (cached) {
    log('debug', 'Returning cached population data', { villageCount: cached.length });
    return cached;
  }

  try {
    const sql = buildPopulationQuery(dbType);
    const rows = await executeQuery<RawPopulationRow>(sql, config);

    const villages = rows.map((row) => {
      const summary = toVillageSummary(row);
      const validation = validateVillageSummary(summary);
      if (!validation.isValid) {
        log('warn', `Village validation warnings`, {
          villageId: summary.villageId,
          errors: validation.errors,
        });
      }
      return summary;
    });

    log('info', 'Population data fetched successfully', { villageCount: villages.length });
    setCache(cacheKey, villages);
    return villages;
  } catch (error) {
    log('error', 'Failed to fetch village population', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
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
    const rawScreening = screeningMap.get(village.villageId);
    const comorbidities = comorbidityMap.get(village.villageId) ?? null;

    // Transform raw screening data to ScreeningCoverage type
    const screening: ScreeningCoverage | null = rawScreening
      ? toScreeningCoverage(rawScreening)
      : null;

    // Merge screening coverage into disease stats
    const diseasesWithScreening = screening
      ? mergeScreeningCoverage(diseases, screening)
      : diseases;

    return {
      village,
      diseases: diseasesWithScreening,
      comorbidities,
      screening,
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
