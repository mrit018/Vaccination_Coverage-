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
  // HOSxP uses epi_vaccine table for vaccine codes
  // person_vaccine links person to vaccines
  const sql = `
    SELECT
      v.vaccine_code,
      v.vaccine_name,
      (SELECT COUNT(*) FROM person p WHERE p.death <> 'Y' AND p.house_regist_type_id IN ('1','3')) as target_count,
      COUNT(DISTINCT pv.person_id) as received_count
    FROM epi_vaccine v
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
 * Note: Uses village as school proxy if school table doesn't exist
 */
export async function getSchoolCoverage(
  config: ConnectionConfig,
  _dbType: DatabaseType,
): Promise<SchoolCoverage[]> {
  // HOSxP may not have school table - use village as fallback
  const sql = `
    SELECT
      v.village_id as school_id,
      CONCAT('หมู่ ', v.village_moo, ' ', v.village_name) as school_name,
      COUNT(DISTINCT p.person_id) as student_count,
      COUNT(DISTINCT CASE WHEN pv.vaccine_code IS NOT NULL THEN p.person_id END) as vaccinated_count
    FROM village v
    LEFT JOIN house h ON v.village_id = h.village_id
    LEFT JOIN person p ON h.house_id = p.house_id AND p.death <> 'Y'
      AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 6 AND 18
    LEFT JOIN person_vaccine pv ON p.person_id = pv.person_id AND pv.vaccine_code IN ('MMR1', 'MMR2')
    WHERE v.village_moo != '0'
    GROUP BY v.village_id, v.village_moo, v.village_name
    HAVING student_count > 0
    ORDER BY student_count DESC
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
