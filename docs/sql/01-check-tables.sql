-- =============================================================================
-- Test SQL Queries - ตรวจสอบตารางที่จำเป็น
-- =============================================================================
-- รันคำสั่งเหล่านี้เพื่อตรวจสอบว่าตารางมีอยู่และมีข้อมูลหรือไม่

-- 1. ตรวจสอบตาราง village
SELECT COUNT(*) as village_count FROM village;

-- 2. ตรวจสอบตาราง house
SELECT COUNT(*) as house_count FROM house;

-- 3. ตรวจสอบตาราง person
SELECT COUNT(*) as person_count FROM person;

-- 4. ตรวจสอบตาราง patient
SELECT COUNT(*) as patient_count FROM patient;

-- 5. ตรวจสอบตาราง clinicmember
SELECT COUNT(*) as clinicmember_count FROM clinicmember;

-- 6. ตรวจสอบตาราง clinic
SELECT clinic, name FROM clinic WHERE clinic IN ('001', '002', '003', '004', '005', '006', '007', '008');

-- 7. ตรวจสอบว่า village มี moo อะไรบ้าง
SELECT village_moo, COUNT(*) as cnt FROM village GROUP BY village_moo ORDER BY village_moo;

-- 8. ตรวจสอบการเชื่อมโยง person -> house -> village
SELECT
    v.village_moo,
    v.village_name,
    COUNT(DISTINCT h.house_id) as houses,
    COUNT(DISTINCT p.person_id) as persons
FROM village v
LEFT JOIN house h ON v.village_id = h.village_id
LEFT JOIN person p ON h.house_id = p.house_id
GROUP BY v.village_moo, v.village_name
ORDER BY v.village_moo
LIMIT 20;
