// =============================================================================
// BMS Session KPI Dashboard - Vaccination Coverage Service
// =============================================================================

import type {
  ConnectionConfig,
  DatabaseType,
  VaccineCoverage,
  SchoolCoverage,
  SqlApiResponse,
} from '@/types';

import { executeSqlViaApi } from '@/services/bmsSession';

/**
 * Map raw {@link SqlApiResponse} rows into a typed array using the supplied
 * mapper function.
 */
function parseQueryResponse<T>(
  response: SqlApiResponse,
  mapper: (row: Record<string, unknown>) => T,
): T[] {
  if (!response.data || !Array.isArray(response.data)) {
    return [];
  }
  return response.data.map(mapper);
}

// ---------------------------------------------------------------------------
// Vaccination Coverage Analysis
// ---------------------------------------------------------------------------

/**
 * Get vaccination coverage for target population.
 * (ความครอบคลุมวัคซีนตามเกณฑ์เป้าหมาย 90%)
 */
export async function getVaccinationCoverage(
  config: ConnectionConfig,
  _dbType: DatabaseType,
): Promise<VaccineCoverage[]> {
  // Simulating query to person and person_vaccine tables
  // In real HOSxP: Join person with person_vaccine to find counts
  const sql = `
    SELECT 
      v.vaccine_code, 
      v.vaccine_name,
      (SELECT COUNT(*) FROM person p WHERE p.death <> 'Y' AND p.house_regist_type_id IN ('1','3')) as target_count,
      COUNT(DISTINCT pv.person_id) as received_count
    FROM vaccine_code v
    LEFT JOIN person_vaccine pv ON v.vaccine_code = pv.vaccine_code
    WHERE v.vaccine_code IN ('DTP1', 'DTP3', 'OPV3', 'MMR1', 'JE1', 'CVD19')
    GROUP BY v.vaccine_code, v.vaccine_name
    ORDER BY received_count DESC
  `;
  
  const response = await executeSqlViaApi(sql, config);
  return parseQueryResponse(response, (row) => {
    const target = Number(row['target_count'] ?? 0);
    const received = Number(row['received_count'] ?? 0);
    const percent = target > 0 ? (received / target) * 100 : 0;
    
    return {
      vaccineCode: String(row['vaccine_code'] ?? ''),
      vaccineName: String(row['vaccine_name'] ?? 'Unknown'),
      targetCount: target,
      receivedCount: received,
      coveragePercent: percent,
      isMetGoal: percent >= 90
    };
  });
}

/**
 * Get vaccination coverage in schools (Target 95%).
 * (ความครอบคลุมวัคซีนในโรงเรียน)
 */
export async function getSchoolCoverage(
  config: ConnectionConfig,
  _dbType: DatabaseType,
): Promise<SchoolCoverage[]> {
  const sql = `
    SELECT 
      s.school_id, 
      s.school_name,
      COUNT(p.person_id) as student_count,
      SUM(CASE WHEN pv.vaccine_code IS NOT NULL THEN 1 ELSE 0 END) as vaccinated_count
    FROM school s
    JOIN person p ON s.school_id = p.school_id
    LEFT JOIN person_vaccine pv ON p.person_id = pv.person_id AND pv.vaccine_code = 'MMR2'
    WHERE s.school_id IS NOT NULL
    GROUP BY s.school_id, s.school_name
    LIMIT 20
  `;

  const response = await executeSqlViaApi(sql, config);
  return parseQueryResponse(response, (row) => {
    const target = Number(row['student_count'] ?? 0);
    const received = Number(row['vaccinated_count'] ?? 0);
    const percent = target > 0 ? (received / target) * 100 : 0;

    return {
      schoolId: String(row['school_id'] ?? ''),
      schoolName: String(row['school_name'] ?? 'Unknown'),
      studentCount: target,
      vaccinatedCount: received,
      coveragePercent: percent,
      isMetGoal: percent >= 95
    };
  });
}
