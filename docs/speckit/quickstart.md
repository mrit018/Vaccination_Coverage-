# Quick Start Guide: Village Health Population Dashboard

**Feature**: 001-village-health-dashboard
**Date**: 2026-03-25
**Phase**: Phase 1 - Design & Contracts

## Overview

This guide helps developers quickly understand and implement the Village Health Population Dashboard feature. It provides essential context, setup instructions, and development workflow guidance.

## What is This Feature?

A web dashboard that displays population demographics and health statistics organized by village (หมู่บ้าน) within a hospital's service area. It helps public health officers and hospital administrators:

- View population distribution across villages
- Identify high-risk communities with chronic disease burdens
- Track screening coverage for diabetes and hypertension
- Prioritize intervention programs and resource allocation
- Compare health metrics across multiple villages

## Key Concepts

### Village (หมู่บ้าน)

The smallest administrative unit in Thai public health system. Each village has:
- Unique ID (`village_id`)
- Village number (`village_moo`): 1, 2, 3, ... (0 = out-of-area)
- Name (`village_name`): e.g., "บ้านหนองหอย"
- Multiple houses (บ้าน) and residents (ประชากร)

### Chronic Disease Registry (ทะเบียนโรคเรื้อรัง)

HOSxP tracks 8 NCD (Non-Communicable Disease) types:

| Code | Disease | Thai Name |
|------|---------|-----------|
| 001 | Diabetes (DM) | เบาหวาน |
| 002 | Hypertension (HT) | ความดันโลหิตสูง |
| 003 | COPD | ถุงลมโป่งพอง |
| 004 | Asthma | หอบหืด |
| 005 | Tuberculosis (TB) | วัณโรค |
| 006 | Chronic Kidney Disease (CKD) | โรคไตเรื้อรัง |
| 007 | Cancer | มะเร็ง |
| 008 | Psychiatry | จิตเวช |

### Screening Coverage (การคัดกรอง)

Percentage of eligible population screened for specific diseases:
- Eligible: Adults aged 15-59
- Coverage = (Screened / Eligible) × 100
- Used to identify villages needing outreach programs

## Architecture Overview

```
User Browser
    ↓
VillageHealthDashboard Page (React)
    ↓
useVillageHealth Hook
    ↓
villageHealth Service
    ↓
bmsSession Service (existing)
    ↓
BMS Session API
    ↓
HOSxP Database (MySQL/MariaDB/PostgreSQL)
```

### Data Flow

1. **Authentication**: User arrives with BMS Session ID (from URL or cookie)
2. **Session Retrieval**: App calls `https://hosxp.net/phapi/PasteJSON?Action=GET&code={sessionId}` to get session data
3. **Query Execution**: App posts SQL queries to `{bms_url}/api/sql` with JWT token
4. **Data Transformation**: Raw SQL results converted to domain models
5. **Display**: Components render statistics with charts and tables

## Technology Stack

### Frontend
- **React 19**: UI framework
- **TypeScript 5.x**: Type-safe development (strict mode)
- **Vite 6**: Build tool and dev server
- **shadcn/ui**: Reusable UI components (cards, tables, badges)
- **Recharts 3.x**: Data visualizations (bar charts, pie charts)
- **TanStack Table v8**: Sortable/filterable tables
- **date-fns**: Date manipulation and formatting

### Backend
- **BMS Session API**: Authentication and query execution
- **HOSxP Database**: Read-only SQL access to village, house, person, clinicmember tables

### Testing
- **Vitest**: Unit testing
- **React Testing Library**: Component testing
- **MSW**: API mocking for contract tests

## File Structure

```
src/
├── services/
│   └── villageHealth.ts          # SQL query functions
├── hooks/
│   └── useVillageHealth.ts       # Data fetching hook
├── components/village/
│   ├── VillageList.tsx           # Main list view
│   ├── VillageCard.tsx           # Summary card
│   ├── VillageDetail.tsx         # Expanded detail view
│   ├── PopulationChart.tsx       # Demographic charts
│   └── HealthMetrics.tsx         # Disease statistics
├── pages/
│   └── VillageHealthDashboard.tsx # Page component
└── types/
    └── villageHealth.ts          # TypeScript interfaces
```

## Development Workflow

### 1. Setup Development Environment

```bash
# Navigate to repository
cd /workspace/repo

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

### 2. Implement Features (TDD Workflow)

Follow the Red-Green-Refactor cycle:

```bash
# Step 1: Write test (RED)
# Create test file for service/hook/component
npm test -- tests/unit/services/villageHealth.test.ts

# Step 2: Run test - it should fail (RED)
# Step 3: Implement minimum code to pass test (GREEN)
# Step 4: Run test again - it should pass (GREEN)
npm test -- tests/unit/services/villageHealth.test.ts

# Step 5: Refactor while keeping tests green
# Step 6: Commit
git commit -m "feat: implement village population query"
```

### 3. Test Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- villageHealth

# Check TypeScript types
npm run type-check

# Lint code
npm run lint
```

### 4. View Dashboard

1. Open browser to `http://localhost:5173`
2. Navigate to `/village-health` (route will be configured)
3. Provide BMS Session ID (via URL param: `?bms-session-id=YOUR_SESSION_ID`)
4. View village population and health statistics

## Key SQL Queries

### Get Village Population

```sql
SELECT
  v.village_id,
  v.village_moo,
  v.village_name,
  COUNT(DISTINCT h.house_id) as household_count,
  COUNT(DISTINCT p.person_id) as total_population,
  SUM(CASE WHEN p.sex = '1' AND p.death = 'N' THEN 1 ELSE 0 END) as male_count,
  SUM(CASE WHEN p.sex = '2' AND p.death = 'N' THEN 1 ELSE 0 END) as female_count,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) < 15 AND p.death = 'N' THEN 1 ELSE 0 END) as age_0_14,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) BETWEEN 15 AND 59 AND p.death = 'N' THEN 1 ELSE 0 END) as age_15_59,
  SUM(CASE WHEN TIMESTAMPDIFF(YEAR, p.birthdate, CURDATE()) >= 60 AND p.death = 'N' THEN 1 ELSE 0 END) as age_60_plus
FROM village v
LEFT JOIN house h ON v.village_id = h.village_id
LEFT JOIN person p ON h.house_id = p.house_id
WHERE v.village_moo != '0'
GROUP BY v.village_id, v.village_moo, v.village_name
ORDER BY v.village_moo + 0;
```

### Get Disease Statistics

```sql
SELECT
  v.village_id,
  v.village_moo,
  v.village_name,
  c.clinic,
  cl.name as clinic_name,
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
GROUP BY v.village_id, v.village_moo, v.village_name, c.clinic, cl.name
ORDER BY v.village_moo + 0, c.clinic;
```

## Common Tasks

### Add a New Village Health Metric

1. Update `src/types/villageHealth.ts` with new field
2. Add SQL query in `src/services/villageHealth.ts`
3. Update data transformation logic
4. Add component to display metric
5. Write tests for all changes
6. Commit with descriptive message

### Handle Errors Gracefully

```typescript
const { data, error, isLoading } = useVillageHealth();

if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return (
    <ErrorMessage
      title="Cannot load village data"
      message={error.message}
      action={() => window.location.reload()}
      actionLabel="Retry"
    />
  );
}

return <VillageList villages={data} />;
```

### Protect Small Village Privacy

```typescript
function formatVillageData(village: VillageSummary): VillageDisplayModel {
  if (village.totalPopulation < 10) {
    return {
      ...village,
      householdCount: null,
      totalPopulation: null,
      // ... all counts set to null
      privacyWarning: 'ข้อมูลน้อยเกินไป' // Data too limited
    };
  }
  return village;
}
```

## Important Constraints

1. **Read-only access**: No INSERT, UPDATE, DELETE queries allowed
2. **Parameterized queries**: Use `:param_name` syntax to prevent SQL injection
3. **Session timeout**: Queries timeout after 60 seconds
4. **Table limit**: Maximum 20 tables per query
5. **Privacy suppression**: Villages with <10 people show aggregated data only

## Troubleshooting

### Query Timeout

**Problem**: Queries take longer than 60 seconds
**Solution**:
- Add LIMIT clause to reduce result set
- Use aggregate functions instead of retrieving all rows
- Consider pagination for large datasets

### Session Expired

**Problem**: 401 Unauthorized error
**Solution**:
- Prompt user to refresh page
- Clear session cookie and re-authenticate
- Check session expiry time in BMS Session API response

### Empty Data

**Problem**: No villages displayed
**Solution**:
- Verify database has village records
- Check if village_moo filter is too restrictive
- Test SQL query directly against database
- Check user permissions in BMS Session

### Chart Not Rendering

**Problem**: Recharts components show blank space
**Solution**:
- Verify data is array with correct structure
- Check for null/undefined values in data
- Ensure chart dimensions (width, height) are set
- Check browser console for React errors

## Next Steps

1. **Read full specification**: `specs/001-village-health-dashboard/spec.md`
2. **Review data model**: `specs/001-village-health-dashboard/data-model.md`
3. **Check SQL contracts**: `specs/001-village-health-dashboard/contracts/sql-queries.md`
4. **Start implementation**: Run `/speckit.tasks` to generate task list
5. **Follow TDD workflow**: Write tests first, then implement

## Support

- **Project docs**: `/workspace/repo/CLAUDE.md`
- **Constitution**: `/workspace/repo/.specify/memory/constitution.md`
- **BMS Session API**: `/workspace/repo/docs/BMS-SESSION-FOR-DEV.md`
- **HOSxP knowledge**: Search via MCP knowledge base tool

## Checklist Before Starting Implementation

- [ ] Read and understand feature specification
- [ ] Review HOSxP database schema for village, house, person, clinicmember tables
- [ ] Understand BMS Session API authentication flow
- [ ] Set up development environment (npm install, npm run dev)
- [ ] Review existing code patterns in src/services/bmsSession.ts
- [ ] Familiarize with shadcn/ui components and Recharts
- [ ] Understand TDD workflow and testing requirements
- [ ] Ready to follow `/speckit.tasks` when generated

---

**Ready to implement? Run `/speckit.tasks` to generate the task list!**
