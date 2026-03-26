# SQL Query Contracts: Village Health Dashboard

**Feature**: 001-village-health-dashboard
**Date**: 2026-03-25
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the SQL query contracts between the village health dashboard and the HOSxP database via the BMS Session API. All queries are read-only (SELECT) and use parameterized inputs to prevent SQL injection.

## Query Contracts

### Query 1: Get Village Population Summary

**Purpose**: Retrieve population demographics for all villages in the hospital's service area.

**Endpoint**: POST `{bms_url}/api/sql`
**Authentication**: Bearer token in Authorization header
**Request Body**:
```json
{
  "sql": "SELECT v.village_id, v.village_moo, v.village_name, COUNT(DISTINCT h.house_id) as household_count, COUNT(DISTINCT p.person_id) as total_population, SUM(CASE WHEN p.sex = '1' AND p.death = 'N' THEN 1 ELSE 0 END) as male_count, SUM(CASE WHEN p.sex = '2' AND p.death = 'N' THEN 1 ELSE 0 END) as female_count, SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) < 15 AND p.death = 'N' THEN 1 ELSE 0 END) as age_0_14, SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 59 AND p.death = 'N' THEN 1 ELSE 0 END) as age_15_59, SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 AND p.death = 'N' THEN 1 ELSE 0 END) as age_60_plus FROM village v LEFT JOIN house h ON v.village_id = h.village_id LEFT JOIN person p ON h.house_id = p.house_id WHERE v.village_moo != '0' GROUP BY v.village_id, v.village_moo, v.village_name ORDER BY v.village_moo + 0",
  "app": "BMS.Dashboard.VillageHealth"
}
```

**Expected Response**:
```json
{
  "MessageCode": 200,
  "Message": "OK",
  "data": [
    {
      "village_id": 1,
      "village_moo": "1",
      "village_name": "บ้านหนองหอย",
      "household_count": 45,
      "total_population": 187,
      "male_count": 92,
      "female_count": 95,
      "age_0_14": 42,
      "age_15_59": 98,
      "age_60_plus": 47
    }
  ],
  "field": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  "field_name": ["village_id", "village_moo", "village_name", "household_count", "total_population", "male_count", "female_count", "age_0_14", "age_15_59", "age_60_plus"],
  "record_count": 1
}
```

**Error Responses**:
- `401`: Session expired or invalid token
- `403`: Insufficient permissions
- `500`: Database query error

**Notes**:
- Excludes village "0" (out-of-area) via `WHERE v.village_moo != '0'`
- Uses LEFT JOIN to include villages with zero population
- Age calculation uses TIMESTAMPDIFF for MySQL/MariaDB
- For PostgreSQL, replace `TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE())` with `AGE(YEAR FROM p.birthdate)`

---

### Query 2: Get Chronic Disease Statistics by Village

**Purpose**: Retrieve chronic disease patient counts per village for all 8 NCD types.

**Request Body**:
```json
{
  "sql": "SELECT v.village_id, v.village_moo, v.village_name, c.clinic, cl.name as clinic_name, COUNT(DISTINCT c.hn) as patient_count FROM village v INNER JOIN house h ON v.village_id = h.village_id INNER JOIN person p ON h.house_id = p.house_id INNER JOIN patient pt ON p.patient_hn = pt.hn INNER JOIN clinicmember c ON pt.hn = c.hn INNER JOIN clinic cl ON c.clinic = cl.clinic WHERE v.village_moo != '0' AND c.discharge = 'N' AND p.death = 'N' GROUP BY v.village_id, v.village_moo, v.village_name, c.clinic, cl.name ORDER BY v.village_moo + 0, c.clinic",
  "app": "BMS.Dashboard.VillageHealth"
}
```

**Expected Response**:
```json
{
  "MessageCode": 200,
  "Message": "OK",
  "data": [
    {
      "village_id": 1,
      "village_moo": "1",
      "village_name": "บ้านหนองหอย",
      "clinic": "001",
      "clinic_name": "เบาหวาน",
      "patient_count": 23
    },
    {
      "village_id": 1,
      "village_moo": "1",
      "village_name": "บ้านหนองหอย",
      "clinic": "002",
      "clinic_name": "ความดันโลหิตสูง",
      "patient_count": 31
    }
  ],
  "field": [2, 2, 2, 2, 2, 2],
  "field_name": ["village_id", "village_moo", "village_name", "clinic", "clinic_name", "patient_count"],
  "record_count": 2
}
```

**Notes**:
- Only counts active patients (`discharge = 'N'`)
- Excludes deceased persons (`p.death = 'N'`)
- Returns one row per village per disease type
- Disease codes: 001=DM, 002=HT, 003=COPD, 004=Asthma, 005=TB, 006=CKD, 007=Cancer, 008=Psychiatry

---

### Query 3: Get DM/HT Screening Coverage by Village

**Purpose**: Calculate screening coverage percentages for diabetes and hypertension.

**Request Body**:
```json
{
  "sql": "SELECT v.village_id, v.village_moo, v.village_name, COUNT(DISTINCT p.person_id) as total_eligible, COUNT(DISTINCT pdmss.person_id) as dm_screened, COUNT(DISTINCT phtss.person_id) as ht_screened, ROUND(COUNT(DISTINCT pdmss.person_id) * 100.0 / COUNT(DISTINCT p.person_id), 2) as dm_coverage_percent, ROUND(COUNT(DISTINCT phtss.person_id) * 100.0 / COUNT(DISTINCT p.person_id), 2) as ht_coverage_percent FROM village v INNER JOIN house h ON v.village_id = h.village_id INNER JOIN person p ON h.house_id = p.house_id AND p.death = 'N' AND TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 59 LEFT JOIN person_dm_screen_status pdmss ON p.person_id = pdmss.person_id LEFT JOIN person_ht_screen_status phtss ON p.person_id = phtss.person_id WHERE v.village_moo != '0' GROUP BY v.village_id, v.village_moo, v.village_name ORDER BY v.village_moo + 0",
  "app": "BMS.Dashboard.VillageHealth"
}
```

**Expected Response**:
```json
{
  "MessageCode": 200,
  "Message": "OK",
  "data": [
    {
      "village_id": 1,
      "village_moo": "1",
      "village_name": "บ้านหนองหอย",
      "total_eligible": 98,
      "dm_screened": 67,
      "ht_screened": 71,
      "dm_coverage_percent": 68.37,
      "ht_coverage_percent": 72.45
    }
  ],
  "field": [2, 2, 2, 2, 2, 2, 2, 2],
  "field_name": ["village_id", "village_moo", "village_name", "total_eligible", "dm_screened", "ht_screened", "dm_coverage_percent", "ht_coverage_percent"],
  "record_count": 1
}
```

**Notes**:
- Eligible population = persons aged 15-59 (Thai public health guideline)
- Coverage = (screened / eligible) × 100
- LEFT JOIN ensures villages with zero screenings are included

---

### Query 4: Get DM/HT Comorbidity Statistics by Village

**Purpose**: Retrieve complication screening results for DM/HT patients per village.

**Request Body**:
```json
{
  "sql": "SELECT v.village_id, v.village_moo, v.village_name, SUM(CASE WHEN cms.has_eye_cormobidity = 'Y' THEN 1 ELSE 0 END) as eye_complication, SUM(CASE WHEN cms.has_foot_cormobidity = 'Y' THEN 1 ELSE 0 END) as foot_complication, SUM(CASE WHEN cms.has_kidney_cormobidity = 'Y' THEN 1 ELSE 0 END) as kidney_complication, SUM(CASE WHEN cms.has_cardiovascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as cardiovascular_complication, SUM(CASE WHEN cms.has_cerebrovascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as cerebrovascular_complication, SUM(CASE WHEN cms.has_peripheralvascular_cormobidity = 'Y' THEN 1 ELSE 0 END) as peripheral_vascular_complication, SUM(CASE WHEN cms.has_dental_cormobidity = 'Y' THEN 1 ELSE 0 END) as dental_complication FROM village v INNER JOIN house h ON v.village_id = h.village_id INNER JOIN person p ON h.house_id = p.house_id INNER JOIN patient pt ON p.patient_hn = pt.hn INNER JOIN clinicmember cm ON pt.hn = cm.hn AND cm.clinic IN ('001', '002') AND cm.discharge = 'N' LEFT JOIN cm_dm_cmbty_screen cms ON cm.clinicmember_id = cms.clinicmember_id WHERE v.village_moo != '0' AND p.death = 'N' GROUP BY v.village_id, v.village_moo, v.village_name ORDER BY v.village_moo + 0",
  "app": "BMS.Dashboard.VillageHealth"
}
```

**Expected Response**:
```json
{
  "MessageCode": 200,
  "Message": "OK",
  "data": [
    {
      "village_id": 1,
      "village_moo": "1",
      "village_name": "บ้านหนองหอย",
      "eye_complication": 5,
      "foot_complication": 3,
      "kidney_complication": 7,
      "cardiovascular_complication": 4,
      "cerebrovascular_complication": 2,
      "peripheral_vascular_complication": 1,
      "dental_complication": 6
    }
  ],
  "field": [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  "field_name": ["village_id", "village_moo", "village_name", "eye_complication", "foot_complication", "kidney_complication", "cardiovascular_complication", "cerebrovascular_complication", "peripheral_vascular_complication", "dental_complication"],
  "record_count": 1
}
```

**Notes**:
- Only includes DM (clinic='001') and HT (clinic='002') patients
- Complications can co-occur (sum may exceed patient count)
- NULL values for villages with no DM/HT patients (filtered out in application)

---

## Response Format Specification

All BMS Session API responses follow this structure:

```typescript
interface BmsSessionResponse<T> {
  MessageCode: number;      // HTTP status code
  Message: string;           // Status message
  data: T[];                 // Result rows (array of objects)
  field: number[];           // Field type codes (1=bool, 2=int, 3=float, 4=datetime, 5=time, 6=string, 7=blob, 9=string)
  field_name: string[];      // Column names
  record_count: number;      // Number of rows returned
}
```

### Field Type Codes

| Code | Type | Description |
|------|------|-------------|
| 1 | Boolean | true/false values |
| 2 | Integer | Whole numbers |
| 3 | Float | Decimal numbers |
| 4 | DateTime | Date and time values |
| 5 | Time | Time-only values |
| 6 | String | Text values |
| 7 | Blob | Binary data |
| 9 | String | Text values (alternative) |

## Error Handling

### Session Errors

**401 Unauthorized**:
```json
{
  "MessageCode": 401,
  "Message": "Session expired or invalid"
}
```
**Action**: Prompt user to refresh page or re-authenticate

**403 Forbidden**:
```json
{
  "MessageCode": 403,
  "Message": "Insufficient permissions"
}
```
**Action**: Display error message with contact information for administrator

### Query Errors

**500 Internal Server Error**:
```json
{
  "MessageCode": 500,
  "Message": "Database query failed: [specific error]"
}
```
**Action**: Display user-friendly error with retry button

### Timeout Errors

**408 Request Timeout**:
```json
{
  "MessageCode": 408,
  "Message": "Query execution timeout (60s)"
}
```
**Action**: Suggest user refine filters or try again later

## Performance Requirements

- Query 1 (Population): <2 seconds for 100 villages
- Query 2 (Diseases): <3 seconds for 100 villages × 8 diseases
- Query 3 (Screening): <2 seconds for 100 villages
- Query 4 (Comorbidities): <2 seconds for 100 villages

**Optimization Strategies**:
- Use database indexes on `village_id`, `house_id`, `person_id`, `hn`, `clinic`
- Parallel execution of independent queries
- Cache results for 5 minutes (balance freshness vs. performance)

## Security Constraints

1. **Read-only**: Only SELECT statements allowed
2. **Parameterized queries**: All user inputs use :param_name syntax
3. **Table limit**: Maximum 20 tables per query (BMS Session API constraint)
4. **Blacklisted tables**: opduser, opdconfig, sys_var, user_var, user_jwt cannot be queried
5. **Session-based authentication**: All queries require valid BMS Session JWT token

## PostgreSQL Compatibility Notes

For PostgreSQL databases, replace these MySQL/MariaDB functions:

| MySQL/MariaDB | PostgreSQL |
|---------------|------------|
| `TIMESTAMPDIFF(YEAR, birthdate, CURDATE())` | `AGE(YEAR FROM birthdate)` |
| `CURDATE()` | `CURRENT_DATE` |
| `ROUND(value, 2)` | `ROUND(value, 2)` (same) |
| `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` | `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` (same) |

## Testing Contracts

### Unit Tests

Test query builders and parameter escapers:
```typescript
describe('buildPopulationQuery', () => {
  it('should generate valid SQL with correct joins', () => {
    const sql = buildPopulationQuery();
    expect(sql).toContain('SELECT');
    expect(sql).toContain('FROM village v');
    expect(sql).toContain('LEFT JOIN house h');
    expect(sql).toContain('LEFT JOIN person p');
  });

  it('should exclude village 0', () => {
    const sql = buildPopulationQuery();
    expect(sql).toContain("WHERE v.village_moo != '0'");
  });
});
```

### Integration Tests

Test actual query execution via BMS Session API:
```typescript
describe('Village Health Queries', () => {
  it('should return village population data', async () => {
    const response = await executeSqlQuery(populationQuery);
    expect(response.MessageCode).toBe(200);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should handle empty result sets gracefully', async () => {
    const response = await executeSqlQuery(invalidVillageQuery);
    expect(response.MessageCode).toBe(200);
    expect(response.data).toEqual([]);
  });
});
```

## Summary

This contract specification ensures:
1. Consistent query patterns across all village health data retrieval
2. Type-safe response parsing
3. Comprehensive error handling
4. Performance optimization guidance
5. Security constraints enforcement
6. Cross-database compatibility (MySQL/MariaDB/PostgreSQL)
