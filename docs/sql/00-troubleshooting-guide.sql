-- =============================================================================
-- Troubleshooting Guide - แก้ไขปัญหาข้อมูลไม่แสดง
-- =============================================================================
-- 4. วิธีตรวจสออย่าว 1. ตรวจสอิตว่าตารางมีข้อมูลไหมไามีว่ามี (village_moo != '0')
-- 2. ถ้าตาราง house มีข้อมูลไหน้าตรวจสอยมีข้อมูล
-- 2. ถ้ามี house และที่ ไม่มีค่า (`house_id`) เชื่อมกับ `house.house_id` เ `house_id` จ =
-- 3. ถถ่คนามี ใช `LEFT join` และที่มีเข้อมูลใน `person` table
-- 4. ถ้าตาราง village_moo เป็น `0` ให้ว่ามี person และที่เริ่งที่ไม่มีคน 3. ให้เริ่ดค่าว่ามีคนน4. ถ้าไม่มีข้อมูล ให้เปิดไปเลื่อว่าเริ่ค่าหมู่บ้านที่ มีคนนและ 3. ถ้าตารางชื่อไมตรงศันชื่ โาย 2. ตรวจสอิ `house_id`, ON v.village_id = h.village_id
      AND h.house_id = p.house_id
    INNER JOIN person p ON h.house_id = p.house_id
  WHERE v.village_moo != '0'
    and p.death = 'N'
  GROUP BY v.village_id, v.village_moo, v.village_name
  ORDER BY CAST(v.village_moo AS UNSIGNED)
  LIMIT 100;
  `;
}

```

  `;
  ORDER by v.village_moo + 0;
  LIMIT 100;
  `;
        LIMIT 10
      LIMIT 10
    `);
    ${selectedVillage && (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{selectedVillage.village.villageName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">หมู่</p>
            <p className="font-medium">{village.villageMoo}</p>
          </div>
          <div>
            <p className="text-gray-500">ประชากร</p>
            <p className="font-medium">{selectedVillage.village.totalPopulation}</p>
          </div>
          <div>
            <p className="text-gray-500">ครัวเรือน</p>
            <p className="font-medium">{selectedVillage.village.householdCount}</p>
          </div>
          <div>
            <p className="text-gray-500">โ ูลภิ 3 สูง 60+ ปี) < 10 คน</p>
          </div>
        </div>
      </div>
    </div>
  );
}  );
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold mb-2"> แดช์ต</อillageชื่อที่ 1 เมนูเส่ที่เมนช้อมย่า
      </div>
    </div>
  );
}
