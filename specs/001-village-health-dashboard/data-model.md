# Data Model: Village Health Population Dashboard

**Feature**: 001-village-health-dashboard
**Date**: 2026-03-25
**Phase**: Phase 1 - Design & Contracts

## Entity Overview

This document defines the data entities used in the Village Health Population Dashboard, derived from HOSxP database tables and transformed for UI display.

## Core Entities

### VillageSummary

Represents aggregated population and health statistics for a single village.

**Fields**:
- `villageId`: number - Primary key from village.village_id
- `villageMoo`: string - Village number (e.g., "1", "2", "15")
- `villageName`: string - Village name (ชื่อหมู่บ้าน)
- `householdCount`: number - Total number of houses in village
- `totalPopulation`: number - Total living persons (death='N')
- `maleCount`: number - Male population
- `femaleCount`: number - Female population
- `age0to14`: number - Population aged 0-14 years
- `age15to59`: number - Population aged 15-59 years
- `age60Plus`: number - Population aged 60+ years
- `isOutOfArea`: boolean - True if village_moo = '0'

**Validation Rules**:
- `totalPopulation` = `maleCount` + `femaleCount`
- `totalPopulation` = `age0to14` + `age15to59` + `age60Plus`
- `householdCount` >= 0
- All counts are non-negative integers

**Source Tables**: village, house, person

### DiseaseStatistics

Represents chronic disease prevalence for a specific village.

**Fields**:
- `villageId`: number - Foreign key to VillageSummary
- `diseaseCode`: string - Disease clinic code (e.g., "001" for DM, "002" for HT)
- `diseaseName`: string - Disease name in Thai (e.g., "เบาหวาน", "ความดันโลหิตสูง")
- `patientCount`: number - Number of registered patients (discharge='N')
- `screeningCoverage`: number | null - Percentage screened (0-100) or null if not applicable
- `lastScreeningDate`: Date | null - Most recent screening date

**Validation Rules**:
- `patientCount` >= 0
- `screeningCoverage` between 0 and 100 (if not null)
- `diseaseCode` must be one of: ["001", "002", "003", "004", "005", "006", "007", "008"]

**Disease Code Mapping**:
- "001": Diabetes (DM) - เบาหวาน
- "002": Hypertension (HT) - ความดันโลหิตสูง
- "003": COPD - ถุงลมโป่งพอง
- "004": Asthma - หอบหืด
- "005": Tuberculosis (TB) - วัณโรค
- "006": Chronic Kidney Disease (CKD) - โรคไตเรื้อรัง
- "007": Cancer - มะเร็ง
- "008": Psychiatry - จิตเวช

**Source Tables**: clinicmember, clinic, person_dm_screen_status, person_ht_screen_status

### ComorbidityStatistics

Represents complication screening results for DM/HT patients in a village.

**Fields**:
- `villageId`: number - Foreign key to VillageSummary
- `eyeComplication`: number - Patients with eye complications
- `footComplication`: number - Patients with foot complications
- `kidneyComplication`: number - Patients with kidney complications
- `cardiovascularComplication`: number - Patients with cardiovascular complications
- `cerebrovascularComplication`: number - Patients with cerebrovascular complications
- `peripheralVascularComplication`: number - Patients with peripheral vascular complications
- `dentalComplication`: number - Patients with dental complications

**Validation Rules**:
- All counts are non-negative integers
- Total complications may exceed patient count (patients can have multiple complications)

**Source Tables**: cm_dm_cmbty_screen, clinicmember

### VillageHealthData

Aggregated view combining all health data for a village.

**Fields**:
- `village`: VillageSummary - Population demographics
- `diseases`: DiseaseStatistics[] - Array of disease statistics (8 NCD types)
- `comorbidities`: ComorbidityStatistics | null - DM/HT complication data (null if no DM/HT patients)

**Validation Rules**:
- `diseases` array length = 8 (one per NCD type)
- Sum of all disease patient counts may exceed total population (patients can have multiple diseases)

## State Transitions

### Data Loading States

**States**:
1. `IDLE`: Initial state, no data requested
2. `LOADING`: Data fetch in progress
3. `SUCCESS`: Data loaded successfully
4. `ERROR`: Data fetch failed

**Transitions**:
- `IDLE` → `LOADING`: User navigates to dashboard page
- `LOADING` → `SUCCESS`: Query completes successfully
- `LOADING` → `ERROR`: Query fails (network, session, database error)
- `ERROR` → `LOADING`: User retries or refreshes

### Village Selection States

**States**:
1. `LIST_VIEW`: All villages displayed in summary list
2. `DETAIL_VIEW`: Single village expanded with full details
3. `COMPARE_MODE`: Multiple villages selected for comparison

**Transitions**:
- `LIST_VIEW` → `DETAIL_VIEW`: User clicks village card/row
- `DETAIL_VIEW` → `LIST_VIEW`: User clicks back/collapse
- `LIST_VIEW` → `COMPARE_MODE`: User selects multiple villages
- `COMPARE_MODE` → `LIST_VIEW`: User clears selection

## Relationships

```
VillageHealthData (1)
├── VillageSummary (1)
│   ├── Derived from: village (1) ──< house (N) ──< person (N)
│   └── Aggregates: householdCount, population by age/sex
├── DiseaseStatistics (8)
│   └── Derived from: clinicmember (N) ──< clinic (1)
└── ComorbidityStatistics (0..1)
    └── Derived from: cm_dm_cmbty_screen (N) ──< clinicmember (1)
```

## Data Transformation Pipeline

### Step 1: Raw SQL Result
```typescript
interface VillageQueryResult {
  village_id: number;
  village_moo: string;
  village_name: string;
  household_count: number;
  total_population: number;
  male_count: number;
  female_count: number;
  age_0_14: number;
  age_15_59: number;
  age_60_plus: number;
}
```

### Step 2: Domain Model Transformation
```typescript
function toVillageSummary(result: VillageQueryResult): VillageSummary {
  return {
    villageId: result.village_id,
    villageMoo: result.village_moo,
    villageName: result.village_name,
    householdCount: result.household_count,
    totalPopulation: result.total_population,
    maleCount: result.male_count,
    femaleCount: result.female_count,
    age0to14: result.age_0_14,
    age15to59: result.age_15_59,
    age60Plus: result.age_60_plus,
    isOutOfArea: result.village_moo === '0'
  };
}
```

### Step 3: UI Display Model
```typescript
interface VillageDisplayModel extends VillageSummary {
  screeningCoverage: number | null;
  highDiseaseBurden: boolean;
  lastUpdated: Date;
}
```

## Privacy Protection

### Small Count Suppression

For villages with `totalPopulation < 10`:
- Replace exact counts with "ข้อมูลน้อยเกินไป" (Data too limited)
- Set `householdCount` to null
- Set all demographic counts to null
- Set `patientCount` to null for diseases
- Display warning icon with tooltip explaining privacy protection

### Rationale

Thai data protection regulations require protection of individual health information. Aggregated statistics with small-count suppression prevent identification of individuals through cross-referencing.

## TypeScript Interfaces

```typescript
// src/types/villageHealth.ts

export interface VillageSummary {
  villageId: number;
  villageMoo: string;
  villageName: string;
  householdCount: number;
  totalPopulation: number;
  maleCount: number;
  femaleCount: number;
  age0to14: number;
  age15to59: number;
  age60Plus: number;
  isOutOfArea: boolean;
}

export interface DiseaseStatistics {
  villageId: number;
  diseaseCode: DiseaseCode;
  diseaseName: string;
  patientCount: number;
  screeningCoverage: number | null;
  lastScreeningDate: Date | null;
}

export type DiseaseCode =
  | "001" // DM
  | "002" // HT
  | "003" // COPD
  | "004" // Asthma
  | "005" // TB
  | "006" // CKD
  | "007" // Cancer
  | "008"; // Psychiatry

export interface ComorbidityStatistics {
  villageId: number;
  eyeComplication: number;
  footComplication: number;
  kidneyComplication: number;
  cardiovascularComplication: number;
  cerebrovascularComplication: number;
  peripheralVascularComplication: number;
  dentalComplication: number;
}

export interface VillageHealthData {
  village: VillageSummary;
  diseases: DiseaseStatistics[];
  comorbidities: ComorbidityStatistics | null;
}

export interface VillageListResponse {
  villages: VillageHealthData[];
  totalCount: number;
  lastUpdated: Date;
}

export type DataLoadingState = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export interface DashboardState {
  dataState: DataLoadingState;
  villages: VillageHealthData[];
  selectedVillageId: number | null;
  filter: VillageFilter;
  sortBy: SortKey;
  sortOrder: 'asc' | 'desc';
  error: Error | null;
}

export interface VillageFilter {
  searchQuery: string;
  minPopulation: number | null;
  diseaseCodes: DiseaseCode[];
  minScreeningCoverage: number | null;
}

export type SortKey =
  | 'villageMoo'
  | 'totalPopulation'
  | 'householdCount'
  | 'diseaseCount'
  | 'screeningCoverage';
```

## Validation Functions

```typescript
// src/utils/villageHealthValidation.ts

export function validateVillageSummary(data: VillageSummary): ValidationResult {
  const errors: string[] = [];

  if (data.totalPopulation !== data.maleCount + data.femaleCount) {
    errors.push('Population mismatch: total != male + female');
  }

  const ageSum = data.age0to14 + data.age15to59 + data.age60Plus;
  if (data.totalPopulation !== ageSum) {
    errors.push('Population mismatch: total != age group sum');
  }

  if (data.householdCount < 0) {
    errors.push('Household count cannot be negative');
  }

  return { isValid: errors.length === 0, errors };
}

export function validateDiseaseStatistics(data: DiseaseStatistics[]): ValidationResult {
  const errors: string[] = [];
  const validCodes = ['001', '002', '003', '004', '005', '006', '007', '008'];

  for (const disease of data) {
    if (!validCodes.includes(disease.diseaseCode)) {
      errors.push(`Invalid disease code: ${disease.diseaseCode}`);
    }

    if (disease.patientCount < 0) {
      errors.push(`${disease.diseaseCode}: patient count cannot be negative`);
    }

    if (disease.screeningCoverage !== null) {
      if (disease.screeningCoverage < 0 || disease.screeningCoverage > 100) {
        errors.push(`${disease.diseaseCode}: screening coverage must be 0-100`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}
```

## Summary

The data model provides a clean separation between:
1. **Raw SQL results** from HOSxP database
2. **Domain models** for business logic
3. **UI display models** for rendering

All entities support privacy protection through small-count suppression and include comprehensive validation rules to ensure data integrity.
