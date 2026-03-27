-- =============================================================================
-- Troubleshooting Guide - แก้ไขปัญหาข้อมูลไม่แสดง
-- =============================================================================

-- === ปัญหาที่ 1: ไม่มีข้อมูลหมู่บ้าน ===
-- สาเหตุ: ตาราง village ไม่มีข้อมูล หรือ village_moo เป็น '0' ทั้งหมด

-- วิธีตรวจสอบ:
SELECT COUNT(*) as total_villages FROM village;
SELECT COUNT(*) as villages_with_moo FROM village WHERE village_moo != '0';
SELECT village_moo, COUNT(*) as cnt FROM village GROUP BY village_moo ORDER BY village_moo;

-- === ปัญหาที่ 2: ไม่มีข้อมูลประชากร ===
-- สาเหตุ: การเชื่อมโยง person -> house -> village ไม่ตรง

-- วิธีตรวจสอบ:
SELECT
  'village' as tbl, COUNT(*) as cnt FROM village
UNION ALL
SELECT 'house', COUNT(*) FROM house
UNION ALL
SELECT 'person', COUNT(*) FROM person
UNION ALL
SELECT 'person_alive', COUNT(*) FROM person WHERE death = 'N';

-- === ปัญหาที่ 3: ไม่มีข้อมูลโรคเรื้อรัง ===
-- สาเหตุ: ตาราง clinicmember ไม่มีข้อมูล หรือการเชื่อมโยงขาด

-- วิธีตรวจสอบ:
SELECT COUNT(*) as total_clinicmember FROM clinicmember;
SELECT COUNT(*) as active_clinicmember FROM clinicmember WHERE discharge = 'N';
SELECT clinic, COUNT(DISTINCT hn) as patients FROM clinicmember WHERE discharge = 'N' GROUP BY clinic ORDER BY clinic;

-- === ปัญหาที่ 4: person.patient_hn ไม่ตรงกับ patient.hn ===
-- วิธีตรวจสอบ:
SELECT COUNT(*) as person_with_hn FROM person WHERE patient_hn IS NOT NULL AND patient_hn != '';
SELECT COUNT(*) as matched FROM person p INNER JOIN patient pt ON p.patient_hn = pt.hn;

-- === ปัญหาที่ 5: ตาราง cm_dm_cmbty_screen ไม่มีข้อมูล ===
-- วิธีตรวจสอบ:
SELECT COUNT(*) as total_screenings FROM cm_dm_cmbty_screen;
SELECT COUNT(*) as with_complications FROM cm_dm_cmbty_screen WHERE has_eye_cormobidity = 'Y' OR has_foot_cormobidity = 'Y';

-- === ปัญหาที่ 6: ตาราง screening status ไม่มี ===
-- วิธีตรวจสอบ:
-- SHOW TABLES LIKE 'person_dm_screen%';
-- SHOW TABLES LIKE 'person_ht_screen%';
SELECT COUNT(*) FROM person_dm_screen_status;
SELECT COUNT(*) FROM person_ht_screen_status;

-- === ปัญหาที่ 7: field ชื่อไม่ตรง ===
-- ตรวจสอบโครงสร้างตาราง
DESCRIBE village;
DESCRIBE house;
DESCRIBE person;
DESCRIBE patient;
DESCRIBE clinicmember;
DESCRIBE clinic;
DESCRIBE cm_dm_cmbty_screen;

-- === ปัญหาที่ 8: PostgreSQL vs MySQL syntax ===
-- ถ้าใช้ PostgreSQL ต้องเปลี่ยน:
-- - TIMESTAMPDIFF(YEAR, x, y) → EXTRACT(YEAR FROM AGE(x, y))
-- - CURDATE() → CURRENT_DATE
-- - CAST(x AS UNSIGNED) → CAST(x AS INTEGER)
-- - NULLIF(..., 0) ใช้ได้ทั้งสองระบบ

-- === Quick Test: รันทีละ step ===
-- Step 1: village มีข้อมูลไหม?
SELECT COUNT(*) FROM village WHERE village_moo != '0';

-- Step 2: house เชื่อมกับ village ได้ไหม?
SELECT COUNT(*) FROM house h
INNER JOIN village v ON h.village_id = v.village_id
WHERE v.village_moo != '0';

-- Step 3: person เชื่อมกับ house ได้ไหม?
SELECT COUNT(*) FROM person p
INNER JOIN house h ON p.house_id = h.house_id
INNER JOIN village v ON h.village_id = v.village_id
WHERE v.village_moo != '0' AND p.death = 'N';

-- Step 4: ทุกอย่างเชื่อมกันได้ไหม?
SELECT COUNT(DISTINCT p.person_id) as total_persons
FROM village v
INNER JOIN house h ON v.village_id = h.village_id
INNER JOIN person p ON h.house_id = p.house_id
WHERE v.village_moo != '0' AND p.death = 'N';
