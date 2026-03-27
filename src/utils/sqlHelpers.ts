// =============================================================================
// Village Health Population Dashboard - SQL Query Builders
// =============================================================================

import type { DatabaseType } from '@/types';
import { queryBuilder } from '@/services/queryBuilder';

// ---------------------------------------------------------------------------
// Population Query
// ---------------------------------------------------------------------------

/**
 * Build SQL query for village population summary.
 * Retrieves population demographics for all villages in the hospital's service area.
 */
export function buildPopulationQuery(dbType: DatabaseType = 'mysql'): string {
  const ageCalc = queryBuilder.ageCalc(dbType, 'p.birthdate');

  return `
    SELECT
      v.village_id,
      v.village_moo,
      v.village_name,
      COUNT(DISTINCT h.house_id) as household_count,
      COUNT(DISTINCT CASE WHEN p.death = 'N' THEN p.person_id END) as total_population,
      SUM(CASE WHEN p.sex = '1' AND p.death = 'N' THEN 1 ELSE 0 END) as male_count,
      SUM(CASE WHEN p.sex = '2' AND p.death = 'N' THEN 1 ELSE 0 END) as female_count,
      SUM(CASE WHEN ${ageCalc} < 15 AND p.death = 'N' THEN 1 ELSE 0 END) as age_0_14,
      SUM(CASE WHEN ${ageCalc} BETWEEN 15 AND 59 AND p.death = 'N' THEN 1 ELSE 0 END) as age_15_59,
      SUM(CASE WHEN ${ageCalc} >= 60 AND p.death = 'N' THEN 1 ELSE 0 END) as age_60_plus
    FROM village v
    LEFT JOIN house h ON v.village_id = h.village_id
    LEFT JOIN person p ON h.house_id = p.house_id
    WHERE v.village_moo != '0'
    GROUP BY v.village_id, v.village_moo, v.village_name
    ORDER BY CAST(v.village_moo AS UNSIGNED)
  `.trim();
}

// ---------------------------------------------------------------------------
// Disease Statistics Query
// ---------------------------------------------------------------------------

/**
 * Build SQL query for chronic disease patient counts per village.
 * Returns counts for all 8 NCD types (DM, HT, COPD, Asthma, TB, CKD, Cancer, Psychiatry).
 * Uses LEFT JOINs to handle cases where person.patient_hn may be NULL
 */
export function buildDiseaseQuery(_dbType: DatabaseType = 'mysql'): string {
  return `
    SELECT
      v.village_id,
      v.village_moo,
      v.village_name,
      c.clinic as disease_code,
      cl.name as disease_name,
      COUNT(DISTINCT c.hn) as patient_count
    FROM village v
    INNER JOIN house h ON v.village_id = h.village_id
    INNER JOIN person p ON h.house_id = p.house_id AND p.death = 'N'
    LEFT JOIN patient pt ON p.patient_hn = pt.hn
    INNER JOIN clinicmember c ON COALESCE(pt.hn, p.patient_hn) = c.hn
      AND c.discharge = 'N'
    INNER JOIN clinic cl ON c.clinic = cl.clinic
    WHERE v.village_moo != '0'
      AND c.clinic IN ('001', '002', '003', '004', '005', '006', '007', '008')
    GROUP BY v.village_id, v.village_moo, v.village_name, c.clinic, cl.name
    ORDER BY CAST(v.village_moo AS UNSIGNED), c.clinic
  `.trim();
}

// ---------------------------------------------------------------------------
// Screening Coverage Query
// ---------------------------------------------------------------------------

/**
 * Build SQL query for DM/HT screening coverage by village.
 * Calculates screening percentages for eligible population (ages 15-59).
 * Note: Uses clinicmember as screening proxy if screening status tables don't exist
 */
export function buildScreeningQuery(dbType: DatabaseType = 'mysql'): string {
  const ageCalc = queryBuilder.ageCalc(dbType, 'p.birthdate');

  return `
    SELECT
      v.village_id,
      v.village_moo,
      v.village_name,
      COUNT(DISTINCT p.person_id) as total_eligible,
      COUNT(DISTINCT CASE WHEN cm_dm.clinicmember_id IS NOT NULL THEN p.person_id END) as dm_screened,
      COUNT(DISTINCT CASE WHEN cm_ht.clinicmember_id IS NOT NULL THEN p.person_id END) as ht_screened,
      ROUND(COUNT(DISTINCT CASE WHEN cm_dm.clinicmember_id IS NOT NULL THEN p.person_id END) * 100.0
        / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as dm_coverage_percent,
      ROUND(COUNT(DISTINCT CASE WHEN cm_ht.clinicmember_id IS NOT NULL THEN p.person_id END) * 100.0
        / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as ht_coverage_percent
    FROM village v
    INNER JOIN house h ON v.village_id = h.village_id
    INNER JOIN person p ON h.house_id = p.house_id
      AND p.death = 'N'
      AND ${ageCalc} BETWEEN 15 AND 59
    LEFT JOIN patient pt ON p.patient_hn = pt.hn
    LEFT JOIN clinicmember cm_dm ON pt.hn = cm_dm.hn AND cm_dm.clinic = '001' AND cm_dm.discharge = 'N'
    LEFT JOIN clinicmember cm_ht ON pt.hn = cm_ht.hn AND cm_ht.clinic = '002' AND cm_ht.discharge = 'N'
    WHERE v.village_moo != '0'
    GROUP BY v.village_id, v.village_moo, v.village_name
    ORDER BY CAST(v.village_moo AS UNSIGNED)
  `.trim();
}

// ---------------------------------------------------------------------------
// Comorbidity Statistics Query
// ---------------------------------------------------------------------------

/**
 * Build SQL query for DM/HT complication screening results by village.
 * Returns counts for eye, foot, kidney, cardiovascular, cerebrovascular,
 * peripheral vascular, and dental complications.
 * Uses LEFT JOINs to handle cases where tables or columns may not exist
 */
export function buildComorbidityQuery(_dbType: DatabaseType = 'mysql'): string {
  return `
    SELECT
      v.village_id,
      v.village_moo,
      v.village_name,
      SUM(CASE WHEN cms.has_eye_cormobidity = 'Y' THEN 1 ELSE 0 END) as eye_complication,
      SUM(CASE WHEN cms.has_foot_cormobidity = 'Y' THEN 1 ELSE 0 END) as foot_complication,
      SUM(CASE WHEN cms.has_kidney_cormobidity = 'Y' THEN 1 ELSE 0 END) as kidney_complication,
      SUM(CASE WHEN cms.has_cardiovascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as cardiovascular_complication,
      SUM(CASE WHEN cms.has_cerebrovascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as cerebrovascular_complication,
      SUM(CASE WHEN cms.has_peripheralvascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as peripheral_vascular_complication,
      SUM(CASE WHEN cms.has_dental_cormobidity = 'Y' THEN 1 ELSE 0 END) as dental_complication
    FROM village v
    INNER JOIN house h ON v.village_id = h.village_id
    INNER JOIN person p ON h.house_id = p.house_id AND p.death = 'N'
    LEFT JOIN patient pt ON p.patient_hn = pt.hn
    INNER JOIN clinicmember cm ON COALESCE(pt.hn, p.patient_hn) = cm.hn
      AND cm.clinic IN ('001', '002')
      AND cm.discharge = 'N'
    LEFT JOIN cm_dm_cmbty_screen cms ON cm.clinicmember_id = cms.clinicmember_id
    WHERE v.village_moo != '0'
    GROUP BY v.village_id, v.village_moo, v.village_name
    ORDER BY CAST(v.village_moo AS UNSIGNED)
  `.trim();
}

// ---------------------------------------------------------------------------
// Out-of-Area Village Query
// ---------------------------------------------------------------------------

/**
 * Build SQL query for village "0" (out-of-area residents).
 * These are patients who live outside the hospital's primary service area.
 */
export function buildOutOfAreaQuery(dbType: DatabaseType = 'mysql'): string {
  const ageCalc = queryBuilder.ageCalc(dbType, 'p.birthdate');

  return `
    SELECT
      v.village_id,
      v.village_moo,
      v.village_name,
      COUNT(DISTINCT h.house_id) as household_count,
      COUNT(DISTINCT CASE WHEN p.death = 'N' THEN p.person_id END) as total_population,
      SUM(CASE WHEN p.sex = '1' AND p.death = 'N' THEN 1 ELSE 0 END) as male_count,
      SUM(CASE WHEN p.sex = '2' AND p.death = 'N' THEN 1 ELSE 0 END) as female_count,
      SUM(CASE WHEN ${ageCalc} < 15 AND p.death = 'N' THEN 1 ELSE 0 END) as age_0_14,
      SUM(CASE WHEN ${ageCalc} BETWEEN 15 AND 59 AND p.death = 'N' THEN 1 ELSE 0 END) as age_15_59,
      SUM(CASE WHEN ${ageCalc} >= 60 AND p.death = 'N' THEN 1 ELSE 0 END) as age_60_plus
    FROM village v
    LEFT JOIN house h ON v.village_id = h.village_id
    LEFT JOIN person p ON h.house_id = p.house_id
    WHERE v.village_moo = '0'
    GROUP BY v.village_id, v.village_moo, v.village_name
  `.trim();
}
