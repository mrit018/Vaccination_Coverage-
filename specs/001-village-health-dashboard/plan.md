# Implementation Plan: Village Health Population Dashboard

**Branch**: `001-village-health-dashboard` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-village-health-dashboard/spec.md`

## Summary

Create a new dashboard page that displays population demographics and health statistics organized by village (moo) within the hospital's service area. The dashboard will aggregate data from HOSxP database tables (village, house, person, clinicmember, screening status) to provide public health officers and hospital administrators with actionable insights for community health planning and resource allocation.

Technical approach: Build a React/TypeScript web application using existing BMS Session infrastructure for authentication and database connectivity. Execute parameterized SQL queries via BMS Session API to retrieve village-level statistics, then display results using shadcn/ui components and Recharts visualizations.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: React 19, Vite 6, shadcn/ui, Recharts 3.x, TanStack Table v8, date-fns
**Storage**: HOSxP database (MySQL/MariaDB/PostgreSQL) accessed via BMS Session API (read-only)
**Testing**: Vitest (unit), React Testing Library (component), MSW (API mocking)
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge) - desktop/tablet usage
**Project Type**: Web application dashboard
**Performance Goals**: Initial page load <10 seconds, query responses <2 seconds, support 100 villages with 50K population
**Constraints**: Read-only SQL access only (SELECT, DESCRIBE, EXPLAIN, SHOW, WITH), max 20 tables per query, parameterized queries required
**Scale/Scope**: ~100 villages, ~50,000 persons, 8 NCD disease types, demographic breakdowns by age/gender

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Gate Evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode enforced, no hardcoded values |
| II. Test-Driven Development | ✅ PASS | TDD workflow mandated in tasks, 4 test layers required |
| III. Comprehensive Test Coverage | ✅ PASS | Unit (80% min), component, integration, API tests planned |
| IV. Reusable Components & Functions | ✅ PASS | Will use shared UI components, extract data transformation logic |
| V. Centralized Business Logic | ✅ PASS | SQL queries in services layer, components render-only |
| VI. Informative User Experience | ✅ PASS | Loading states, error messages, empty states designed |
| VII. Performance & Reliability | ✅ PASS | Query timeouts (60s), LIMIT clauses, parameterized queries |
| VIII. Version Control Discipline | ✅ PASS | Atomic commits with descriptive prefixes planned |
| IX. Skill-Driven Development | ✅ PASS | Following speckit workflow, brainstorm→plan→tasks→implement |

**Gate Result**: ✅ ALL PASS - Proceed to Phase 0 Research

### Post-Design Gate Re-evaluation

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality First | ✅ PASS | TypeScript strict mode, interfaces defined, validation functions planned |
| II. Test-Driven Development | ✅ PASS | Test contracts defined, TDD workflow documented |
| III. Comprehensive Test Coverage | ✅ PASS | Unit, component, integration, API test contracts specified |
| IV. Reusable Components & Functions | ✅ PASS | Shared UI components identified, data transformation extracted |
| V. Centralized Business Logic | ✅ PASS | SQL queries in villageHealth service, components render-only |
| VI. Informative User Experience | ✅ PASS | Loading/error states defined, privacy protection implemented |
| VII. Performance & Reliability | ✅ PASS | Query optimization documented, caching strategy defined |
| VIII. Version Control Discipline | ✅ PASS | Atomic commits planned per task |
| IX. Skill-Driven Development | ✅ PASS | Speckit workflow followed, design complete |

**Post-Design Gate Result**: ✅ ALL PASS - Proceed to Phase 2 (Task Generation)

## Project Structure

### Documentation (this feature)

```text
specs/001-village-health-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── bmsSession.ts              # Existing: BMS Session API client
│   └── villageHealth.ts           # NEW: Village health data queries
├── hooks/
│   ├── useBmsSession.ts           # Existing: BMS Session hook
│   └── useVillageHealth.ts        # NEW: Village health data hook
├── components/
│   ├── village/
│   │   ├── VillageList.tsx        # NEW: Village list/table
│   │   ├── VillageCard.tsx        # NEW: Village summary card
│   │   ├── VillageDetail.tsx      # NEW: Village detail view
│   │   ├── PopulationChart.tsx    # NEW: Demographic charts
│   │   └── HealthMetrics.tsx      # NEW: Disease statistics display
│   └── shared/                    # Existing: loading, error, etc.
├── pages/
│   └── VillageHealthDashboard.tsx # NEW: Main dashboard page
├── types/
│   └── villageHealth.ts           # NEW: TypeScript interfaces
└── utils/
    └── sqlHelpers.ts              # NEW: SQL query builders

tests/
├── unit/
│   ├── services/villageHealth.test.ts
│   ├── hooks/useVillageHealth.test.ts
│   └── utils/sqlHelpers.test.ts
├── component/
│   ├── village/VillageList.test.tsx
│   ├── village/VillageCard.test.tsx
│   ├── village/VillageDetail.test.tsx
│   └── village/HealthMetrics.test.tsx
├── integration/
│   └── villageDashboardFlow.test.tsx
└── api/
    └── villageHealthQueries.test.ts
```

**Structure Decision**: Web application structure using existing BMS Session Demo Dashboard architecture. Service layer centralizes SQL queries, components handle rendering only, hooks provide state management. Follows project's established patterns for scalability and maintainability.

## Complexity Tracking

> No constitution violations requiring justification
