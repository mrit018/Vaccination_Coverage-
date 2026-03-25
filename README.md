# BMS Vaccination Coverage Dashboard

แดชบอร์ดติดตามความครอบคลุมวัคซีน (Vaccination Coverage) สำหรับระบบ HOSxP ที่ใช้ BMS Session ID ในการเชื่อมต่อและดึงข้อมูลจากฐานข้อมูลโรงพยาบาล เพื่อสร้างภูมิคุ้มกันหมู่และป้องกันโรคติดเชื้อสำคัญ

## ภาพรวม

ระบบนี้ออกแบบมาเพื่อติดตามสัดส่วนของประชากรเป้าหมายที่ได้รับวัคซีนตามเกณฑ์มาตรฐาน โดยเน้นการเปรียบเทียบกับเป้าหมายหลักเพื่อความปลอดภัยทางสาธารณสุข

### คุณสมบัติหลัก

- **ภูมิคุ้มกันหมู่ (Herd Immunity)**: ติดตามความครอบคลุมวัคซีนพื้นฐาน (DTP, OPV, MMR, JE, COVID-19) โดยมีเป้าหมายความสำเร็จที่ **>90%**
- **เป้าหมายในโรงเรียน (School Health)**: ติดตามความครอบคลุมวัคซีนในกลุ่มวัยเรียน โดยมีเป้าหมายความสำเร็จที่ **>95%**
- **การแจ้งเตือนสถานะ**: แสดง Badge สถานะ "ผ่านเกณฑ์" หรือ "ต่ำกว่าเป้าหมาย" ชัดเจนตามสี (เขียว/แดง)
- **การวิเคราะห์ระดับพื้นที่**: แสดงผลความครอบคลุมแยกตามรายโรงเรียนหรือกลุ่มประชากร

## เทคโนโลยี

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.x |
| Build | Vite 6 |
| UI | shadcn/ui + Tailwind CSS v4 |
| Charts | Recharts 3.x |
| Icons | Lucide React |
| Deploy | Docker (nginx:alpine) |

## การติดตั้งและการใช้งาน

ระบบทำงานผ่านการเชื่อมต่อ BMS Session ID จาก HOSxP โดยตรง:

1. รันระบบผ่าน Docker หรือ npm
2. เข้าใช้งานผ่าน URL ที่มี `?bms-session-id=GUID`
3. ระบบจะประมวลผลข้อมูลความครอบคลุมวัคซีนแบบ Real-time จากฐานข้อมูล HOSxP

## โครงสร้างโปรเจค

```
src/
├── services/
│   ├── bmsSession.ts         # เชื่อมต่อ session
│   ├── vaccinationService.ts # คำนวณ % ความครอบคลุมวัคซีน
├── pages/
│   └── VaccinationCoverage.tsx # หน้าจอแดชบอร์ดหลัก
├── types/
│   └── index.ts              # Data Model (Target/Received/Coverage)
```

## License

Private — BMS (Bangkok Medical Software)
