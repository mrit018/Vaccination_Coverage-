-- =============================================================================
-- 03 - Disease Statistics Query (โรคเรื้อรังแยกตามหมู่บ้าน)
-- =============================================================================
-- แสดงจำนวนผู้ป่วยโรคเรื้อรัง 8 ประเภท แยกตามหมู่บ้าน
-- Clinic Codes: 001=เบาหวาน, 002=ความดัน, 003=โรคหอบหืด, 004=COPD
--               005=วัณโรค, 006=โรคไต, 007=โรคมะเร็ง, 008=จิตเวช

-- === MySQL/MariaDB Version ===
SELECT
  v.village_id,
  v.village_moo,
  v.village_name,
  c.clinic as disease_code,
  cl.name as disease_name,
  COUNT(DISTINCT c.hn) as patient_count
FROM village v
INNER JOIN house h ON v.village_id = h.village_id
INNER JOIN person p ON h.house_id = p.house_id
INNER JOIN patient pt ON p.patient_hn = pt.hn
INNER JOIN clinicmember c ON pt.hn = c.hn
INNER JOIN clinic cl ON c.clinic = cl.clinic
WHERE v.village_moo != '0'
  AND c.discharge = 'N'
  AND p.death = 'N'
  AND c.clinic IN ('001', '002', '003', '004', '005', '006', '007', '008')
GROUP BY v.village_id, v.village_moo, v.village_name, c.clinic, cl.name
ORDER BY CAST(v.village_moo AS UNSIGNED), c.clinic;

-- === Test: ตรวจสอบ clinicmember ทั้งหมด ===
-- SELECT clinic, COUNT(DISTINCT hn) as patient_count
-- FROM clinicmember
-- WHERE discharge = 'N'
-- GROUP BY clinic
-- ORDER BY clinic;

-- === Test: ตรวจสอบการเชื่อมโยง person -> patient -> clinicmember ===
-- SELECT
--   p.person_id,
--   p.fname,
--   p.patient_hn,
--   c.clinic,
--   cl.name as clinic_name
-- FROM person p
-- INNER JOIN patient pt ON p.patient_hn = pt.hn
-- INNER JOIN clinicmember c ON pt.hn = c.hn
-- INNER JOIN clinic cl ON c.clinic = cl.clinic
-- WHERE p.death = 'N' AND c.discharge = 'N'
-- LIMIT 20;
