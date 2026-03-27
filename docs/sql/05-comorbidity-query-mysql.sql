-- =============================================================================
-- 05 - Comorbidity Statistics Query (ภาวะแทรกซ้อนเบาหวาน/ความดัน)
-- =============================================================================
-- แสดงจำนวนผู้ป่วยที่มีภาวะแทรกซ้อน แยกตามหมู่บ้าน
-- สำหรับผู้ป่วยในคลินิกเบาหวาน (001) และความดัน (002)

-- === MySQL/MariaDB Version ===
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
INNER JOIN person p ON h.house_id = p.house_id
INNER JOIN patient pt ON p.patient_hn = pt.hn
INNER JOIN clinicmember cm ON pt.hn = cm.hn
  AND cm.clinic IN ('001', '002')
  AND cm.discharge = 'N'
LEFT JOIN cm_dm_cmbty_screen cms ON cm.clinicmember_id = cms.clinicmember_id
WHERE v.village_moo != '0'
  AND p.death = 'N'
GROUP BY v.village_id, v.village_moo, v.village_name
ORDER BY CAST(v.village_moo AS UNSIGNED);

-- === Test: ตรวจสอบตาราง cm_dm_cmbty_screen ===
-- SELECT COUNT(*) as total_screenings FROM cm_dm_cmbty_screen;

-- === Test: ดูคอลัมน์ใน cm_dm_cmbty_screen ===
-- DESCRIBE cm_dm_cmbty_screen;

-- === Test: ตรวจสอบข้อมูลตัวอย่าง ===
-- SELECT
--   cms.clinicmember_id,
--   cms.has_eye_cormobidity,
--   cms.has_foot_cormobidity,
--   cms.has_kidney_cormobidity
-- FROM cm_dm_cmbty_screen cms
-- LIMIT 20;

-- === Test: ตรวจสอบการเชื่อมโยง clinicmember -> cm_dm_cmbty_screen ===
-- SELECT
--   cm.clinicmember_id,
--   cm.hn,
--   cm.clinic,
--   cms.has_eye_cormobidity
-- FROM clinicmember cm
-- LEFT JOIN cm_dm_cmbty_screen cms ON cm.clinicmember_id = cms.clinicmember_id
-- WHERE cm.clinic IN ('001', '002') AND cm.discharge = 'N'
-- LIMIT 20;
