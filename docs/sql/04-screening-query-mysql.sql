-- =============================================================================
-- 04 - Screening Coverage Query (การคัดกรองเบาหวาน/ความดัน)
-- =============================================================================
-- แสดงร้อยละการคัดกรองเบาหวานและความดันโลหิตสูงในประชากรอายุ 15-59 ปี

-- === MySQL/MariaDB Version ===
SELECT
  v.village_id,
  v.village_moo,
  v.village_name,
  COUNT(DISTINCT p.person_id) as total_eligible,
  COUNT(DISTINCT pdmss.person_id) as dm_screened,
  COUNT(DISTINCT phtss.person_id) as ht_screened,
  ROUND(COUNT(DISTINCT pdmss.person_id) * 100.0 / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as dm_coverage_percent,
  ROUND(COUNT(DISTINCT phtss.person_id) * 100.0 / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as ht_coverage_percent
FROM village v
INNER JOIN house h ON v.village_id = h.village_id
INNER JOIN person p ON h.house_id = p.house_id
  AND p.death = 'N'
  AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 59
LEFT JOIN person_dm_screen_status pdmss ON p.person_id = pdmss.person_id
LEFT JOIN person_ht_screen_status phtss ON p.person_id = phtss.person_id
WHERE v.village_moo != '0'
GROUP BY v.village_id, v.village_moo, v.village_name
ORDER BY CAST(v.village_moo AS UNSIGNED);

-- === Test: ตรวจสอบตาราง person_dm_screen_status ===
-- SELECT COUNT(*) as dm_screened_count FROM person_dm_screen_status;

-- === Test: ตรวจสอบตาราง person_ht_screen_status ===
-- SELECT COUNT(*) as ht_screened_count FROM person_ht_screen_status;

-- === Test: ตรวจสอบประชากรอายุ 15-59 ปี ===
-- SELECT
--   TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) as age,
--   COUNT(*) as person_count
-- FROM person
-- WHERE death = 'N'
--   AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN 15 AND 59
-- GROUP BY age
-- ORDER BY age;

-- === PostgreSQL Version ===
-- SELECT
--   v.village_id,
--   v.village_moo,
--   v.village_name,
--   COUNT(DISTINCT p.person_id) as total_eligible,
--   COUNT(DISTINCT pdmss.person_id) as dm_screened,
--   COUNT(DISTINCT phtss.person_id) as ht_screened,
--   ROUND(COUNT(DISTINCT pdmss.person_id) * 100.0 / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as dm_coverage_percent,
--   ROUND(COUNT(DISTINCT phtss.person_id) * 100.0 / NULLIF(COUNT(DISTINCT p.person_id), 0), 2) as ht_coverage_percent
-- FROM village v
-- INNER JOIN house h ON v.village_id = h.village_id
-- INNER JOIN person p ON h.house_id = p.house_id
--   AND p.death = 'N'
--   AND EXTRACT(YEAR FROM AGE(p.birthdate)) BETWEEN 15 AND 59
-- LEFT JOIN person_dm_screen_status pdmss ON p.person_id = pdmss.person_id
-- LEFT JOIN person_ht_screen_status phtss ON p.person_id = phtss.person_id
-- WHERE v.village_moo != '0'
-- GROUP BY v.village_id, v.village_moo, v.village_name
-- ORDER BY CAST(v.village_moo AS INTEGER);
