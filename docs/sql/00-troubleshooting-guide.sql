-- =============================================================================
-- Troubleshooting Guide - แก้ไขปัญหาข้อมูลไม่แสดง
-- =============================================================================

-- === ปัญหาที่ 1: ไม่มีข้อมูลหมู่บ้าน ===
-- วิธีตรวจสอย่า:
 1. ตรวจสอิ `village_moo != '0'
     5.-- 2. ถ้าตาราง house มีข้อมูล
     6. -- 2. ถ้า `house_id` เชื่อมกับ `house.house_id` (ระะ `house_id`)
     7. -- 3. ถ้าตาราง person มีข้อมูลในตาราง person
     8. -- 4. ถ้าไม่มีข้อมูลในตาราง person ให้ว่ามีข้อมูลในตาราง person
     9. -- 5. ถ้าไม่มีค่า,ให้ว่าเริ่มรากใน `village_moo = '0'
     11. -- 6. ตรวจสอิ field `village_name` ในตาราง village
     12. -- 7. ถ้า `village_moo` = '0' และ `p.death = 'N'
     13. -- 8. ถ้าไม่มีข้อมูลทั้งหมู่ที่ 0) ให้ว่าเริ่มชื่อนี ` **วิธีที่ 1 ที่ table ใน HOSxP คือใช้ `clinicmember`
INNER JOIN person p ON h.house_id = p.house_id
WHERE v.village_moo != '0'
  AND p.death = 'N'
GROUP BY v.village_id, v.village_moo, v.village_name
ORDER BY CAST(v.village_moo AS UNSIGNED)
LIMIT 100;

-- === Quick Test: ทดสรันแต่ละ step ===
-- 1. ตรวจสอบิอว่า `village` มีข้อมูลไหม
SELECT COUNT(*) as village_count FROM village;

-- 2. ตรวจสอิดว่า `village_moo` != '0' มีข้อมูล
SELECT village_moo, COUNT(*) as cnt FROM village GROUP BY village_moo ORDER BY village_moo;

-- 3. วิธีตรวจสอย่าง 1. มีข้อมูลในตาราง house (ถ้าไม่มีข้อมูลให้แสดเป็ null)
    4. ถ้าตาราง house เชื่อมกับ village ได้ แต่ละไม่มี ให้ตรวจสอิ์ว่ามี null
    5. ถ้าตาราง person มีข้อมูล ให้ JOIN ตาราง house กับ village กับดูว่ามีการเชื่อมโยง
    6. ถ้า `person.patient_hn` เป็ NULL หรือไม่มีความสัมพันษุ Person
    7. ตรวจสอิดความ `person.patient_hn` เป็ NULL หรือไม่มีค่า
        SELECT COUNT(*) as person_with_hn FROM person WHERE patient_hn IS NOT NULL AND patient_hn != '';
        SELECT COUNT(*) as matched FROM person p INNER JOIN patient pt ON p.patient_hn = pt.hn;

    -- 8. ถ้ายา `cm_dm_cmbty_screen` ไม่มีข้อมูล ให้ดูว่ามีข้อมูลบุืถ ้ SELECT COUNT(*) as total_screenings FROM cm_dm_cmbty_screen;
    SELECT COUNT(*) as with_complications FROM cm_dm_cmbty_screen WHERE has_eye_cormobidity = 'Y' OR has_foot_cormobidity = 'Y' OR has_kidney_cormobidity = 'Y' OR has_cardiovascular_cormobidity = 'Y' OR has_cerebrovascular_cormobidity = 'Y' or has_peripheralvascular_cormobidity = 'Y' or has_dental_cormobidity = 'Y';

-- 9.  ปัญหาที่ 9: ตาราง `person_dm_screen_status` และ `person_ht_screen_status` ไม่มี ให้ดูว่ามีข้อมูลในตารางนี้ว่างานการเชื่อมกับ screening status
    - หรือจะคัดกรองว่าไม่มีข้อมูล ให้ลอง query ใหม่ให้จะลอง query แยกออกมา

**สาเหตุุ์ต้องตรวจสอบ:**

1. **`village` มีข้อมูลไหม** (เปิด `village` ในเบราว์ `SHOW TABLES LIKE 'person_dm_screen%'`
`SHOW TABLES LIKE 'person_ht_screen%'`
SELECT COUNT(*) FROM person_dm_screen_status;
SELECT COUNT(*) FROM person_ht_screen_status;

```

-- === Quick Test: ทดสรันทีละ step ===
-- 1. village มีข้อมูลไหม?
SELECT COUNT(*) FROM village WHERE village_moo != '0';

-- Step 2: house เชื่อมกับ village ได้ไหม
SELECT COUNT(*) FROM house h
INNER JOIN village v ON h.village_id = v.village_id
WHERE v.village_moo != '0';

-- Step 3: person เชื่อมกับ house ได้ไหม
SELECT COUNT(*) FROM person p
INNER JOIN house h ON p.house_id = h.house_id
INNER JOIN village v ON h.village_id = v.village_id
WHERE v.village_moo != '0' AND p.death = 'N';
-- Step 4: ทุกอย่างเชื่อมกันได้ไหม
SELECT COUNT(DISTINCT p.person_id) as total_persons
FROM village v
INNER JOIN house h ON v.village_id = h.village_id
INNER JOIN person p ON h.house_id = p.house_id
WHERE v.village_moo != '0' AND p.death = 'N';
```

Now let me commit and push the changes. Let me also create a simpler version of the troubleshooting file that the user can use to test directly in their database console. Then run the the step-by-step to queries to find the issue. If the fixes don't work, the query will fail. they can refer to the specific SQL file for that query. I'll also update the error message in the dashboard to be more helpful.

</parameter>
</invoke>}
</invoke>}

Let me simplify the troubleshooting guide to: create a simpler test file. and show the summary to the user. Then commit and push to both remotes. Let's do this now. The write simplified SQL queries for testing directly in their database console (or through the browser dev tools) if needed) to verify the table structure.I'll also help explain what might be wrong and provide clearer documentation.

</parameter>