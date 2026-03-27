-- =============================================================================
-- 06 - Out-of-Area Village Query (หมู่บ้านนอกเขต - หมู่ 0)
-- =============================================================================
-- แสดงประชากรที่ไม่ได้อยู่ในเขตรับผิดชอบ (village_moo = '0')

-- === MySQL/MariaDB Version ===
SELECT
  v.village_id,
  v.village_moo,
  v.village_name,
  COUNT(DISTINCT h.house_id) as household_count,
  COUNT(DISTINCT CASE WHEN p.death = 'N' THEN p.person_id END) as total_population,
  SUM(CASE WHEN p.sex = '1' AND p.death = 'N' THEN 1 ELSE 0 END) as male_count,
  SUM(CASE WHEN p.sex = '2' AND p.death = 'N' THEN 1 ELSE 0 END) as female_count,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) < 15 AND p.death = 'N' THEN 1 ELSE 0 END) as age_0_14,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 59 AND p.death = 'N' THEN 1 ELSE 0 END) as age_15_59,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 AND p.death = 'N' THEN 1 ELSE 0 END) as age_60_plus
FROM village v
LEFT JOIN house h ON v.village_id = h.village_id
LEFT JOIN person p ON h.house_id = p.house_id
WHERE v.village_moo = '0'
GROUP BY v.village_id, v.village_moo, v.village_name;

-- === Test: ตรวจสอบ village_moo = '0' ===
-- SELECT village_id, village_moo, village_name FROM village WHERE village_moo = '0';

-- === Test: ตรวจสอบบ้านใน village_moo = '0' ===
-- SELECT COUNT(*) as house_count FROM house h
-- INNER JOIN village v ON h.village_id = v.village_id
-- WHERE v.village_moo = '0';
