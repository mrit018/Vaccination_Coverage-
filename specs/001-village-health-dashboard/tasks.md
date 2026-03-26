# Tasks: Village Health Population Dashboard

**Input**: Design documents from `/specs/001-village-health-dashboard/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sql-queries.md

**Tests**: This project follows TDD (Test-Driven Development) per Constitution Principle II. All 4 test layers are REQUIRED: unit (80% min), component, integration, API contract.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application using the repository root structure:
- Source: `src/` at repository root
- Tests: `tests/` at repository root
- Components: `src/components/` for React components
- Services: `src/services/` for business logic
- Hooks: `src/hooks/` for React hooks
- Types: `src/types/` for TypeScript interfaces

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create directory structure per plan.md: src/components/village/, src/services/, src/hooks/, src/types/, src/utils/, tests/unit/, tests/component/, tests/integration/, tests/api/
- [X] T002 [P] Create TypeScript interfaces in src/types/villageHealth.ts (VillageSummary, DiseaseStatistics, ComorbidityStatistics, VillageHealthData, DashboardState)
- [X] T003 [P] Install and verify Recharts 3.x dependency for data visualizations
- [X] T004 [P] Install and verify TanStack Table v8 dependency for sortable/filterable tables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Create directory structure per plan.md: src/components/village/, src/services/, src/hooks/, src/types/, src/utils/, tests/unit/, tests/component/, tests/integration/, tests/api/
- [x] T002 [P] [US1] Create TypeScript interfaces in src/types/villageHealth.ts (VillageSummary, DiseaseStatistics, ComorbidityStatistics, VillageHealthData, DashboardState)
- [ ] T003 [P] [US1] Install and verify Recharts 3.x dependency for data visualizations
- [ ] T004 [P] [US1] Install and verify TanStack Table v8 dependency for sortable/filterable tables
- [ ] T005 [P] [US2] Create SQL query builder utilities in src/utils/sqlHelpers.ts (buildPopulationQuery, buildDiseaseQuery, buildScreeningQuery, buildComorbidityQuery)
- [ ] T006 [P] [US2] Create data validation functions in src/utils/villageHealthValidation.ts (validateVillageSummary, validateDiseaseStatistics)
- [ ] T007 [P] [US3] Create data transformation functions in src/utils/villageDataTransformers.ts (toVillageSummary, toDiseaseStatistics, toComorbidityStatistics)
- [ ] T008 [P] [US4] Implement village health service in src/services/villageHealth.ts (fetchVillagePopulation, fetchDiseaseStatistics, fetchScreeningCoverage, fetchComorbidityStatistics)
- [x] T009 [P] [US5] Create useVillageHealth hook in src/hooks/useVillageHealth.ts (data fetching, state management, error handling)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Village Population Overview (Priority: P1) 🎯 MVP

**Goal**: Display comprehensive population demographics organized by village so users can understand population distribution across communities

**Independent Test**: Navigate to village health dashboard page, verify all villages display with population counts, demographic breakdowns (age groups, gender), and household information. Delivers immediate value for operational planning.

### Tests for User Story 1 (TDD - Write FIRST, ensure they FAIL)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for buildPopulationQuery in tests/unit/services/villageHealth.test.ts
- [ ] T011 [P] [US1] Unit test for toVillageSummary transformer in tests/unit/utils/villageDataTransformers.test.ts
- [ ] T012 [P] [US1] Unit test for validateVillageSummary in tests/unit/utils/villageHealthValidation.test.ts
- [ ] T013 [P] [US1] API contract test for population query in tests/api/villageHealthQueries.test.ts
- [ ] T014 [P] [US1] Component test for VillageCard in tests/component/village/VillageCard.test.tsx
- [ ] T015 [P] [US1] Component test for VillageList in tests/component/village/VillageList.test.tsx
- [ ] T016 [US1] Integration test for population dashboard flow in tests/integration/villagePopulationFlow.test.tsx

### Implementation for User Story 1

- [X] T017 [P] [US1] Create VillageCard component in src/components/village/VillageCard.tsx (displays village name, population count, household count, demographic summary)
- [X] T018 [P] [US1] Create PopulationChart component in src/components/village/PopulationChart.tsx (pie chart for gender distribution, bar chart for age groups using Recharts)
- [X] T019 [US1] Create VillageList component in src/components/village/VillageList.tsx (renders list of VillageCard components, handles loading/error states)
- [X] T020 [US1] Create VillageHealthDashboard page in src/pages/VillageHealthDashboard.tsx (main page component, integrates VillageList, handles BMS Session authentication)
- [X] T021 [US1] Add route configuration for /village-health in routing setup
- [ ] T022 [US1] Implement privacy protection for small villages (<10 population) in src/utils/villageDataTransformers.ts (replace counts with "ข้อมูลน้อยเกินไป")
- [ ] T023 [US1] Add loading states with skeleton screens in VillageList component
- [ ] T024 [US1] Add error states with actionable messages and retry button in VillageList component
- [ ] T025 [US1] Add empty state with guidance when no villages found in VillageList component
- [ ] T026 [US1] Mark village "0" as "Out of Area" with visual distinction (badge/icon) in VillageCard component

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can view village population overview with demographics.

---

## Phase 4: User Story 2 - Analyze Health Issues by Village (Priority: P2)

**Goal**: Display summary statistics of prevalent health problems (chronic diseases) for each village so users can identify high-risk communities and prioritize interventions

**Independent Test**: View health statistics displayed alongside villages, verify chronic disease counts (DM, HT, COPD, Asthma, CKD, Cancer, TB, Psychiatry) and screening coverage percentages. Delivers value by highlighting communities needing attention.

### Tests for User Story 2 (TDD - Write FIRST, ensure they FAIL)

- [ ] T027 [P] [US2] Unit test for buildDiseaseQuery in tests/unit/services/villageHealth.test.ts
- [ ] T028 [P] [US2] Unit test for buildScreeningQuery in tests/unit/services/villageHealth.test.ts
- [ ] T029 [P] [US2] Unit test for toDiseaseStatistics transformer in tests/unit/utils/villageDataTransformers.test.ts
- [ ] T030 [P] [US2] API contract test for disease statistics query in tests/api/villageHealthQueries.test.ts
- [ ] T031 [P] [US2] Component test for HealthMetrics in tests/component/village/HealthMetrics.test.tsx
- [ ] T032 [US2] Integration test for health statistics display in tests/integration/villageHealthFlow.test.tsx

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create HealthMetrics component in src/components/village/HealthMetrics.tsx (displays disease counts per village with disease names in Thai)
- [ ] T034 [P] [US2] Create DiseaseChart component in src/components/village/DiseaseChart.tsx (bar chart showing disease counts across villages using Recharts)
- [ ] T035 [P] [US2] Implement screening coverage display in HealthMetrics component (shows DM/HT screening percentages with visual indicators)
- [ ] T036 [US2] Add color coding for high disease prevalence in HealthMetrics component (green=low, yellow=medium, red=high based on thresholds)
- [ ] T037 [US2] Integrate disease statistics into VillageCard component (shows disease summary badges/icons)
- [ ] T038 [US2] Implement comorbidity statistics display in src/components/village/VillageDetail.tsx (shows eye, foot, kidney, cardiovascular, cerebrovascular, peripheral vascular, dental complications)
- [ ] T039 [US2] Create VillageDetail expandable view in src/components/village/VillageDetail.tsx (drills down from VillageCard to show full health metrics)
- [ ] T040 [US2] Add last screening date display in VillageDetail component
- [ ] T041 [US2] Update VillageList to support expand/collapse for VillageDetail view

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can view population overview AND analyze health issues by village.

---

## Phase 5: User Story 3 - Compare Villages and Identify Priorities (Priority: P3)

**Goal**: Enable comparison of health metrics across multiple villages simultaneously so users can make data-driven decisions about resource allocation

**Independent Test**: Use comparison features (sorting, filtering, side-by-side views) to identify top-priority villages. Delivers value by facilitating evidence-based planning.

### Tests for User Story 3 (TDD - Write FIRST, ensure they FAIL)

- [ ] T042 [P] [US3] Unit test for filter/sort logic in tests/unit/hooks/useVillageHealth.test.ts
- [ ] T043 [P] [US3] Component test for sortable/filterable table in tests/component/village/VillageTable.test.tsx
- [ ] T044 [US3] Integration test for comparison mode in tests/integration/villageComparisonFlow.test.tsx

### Implementation for User Story 3

- [ ] T045 [P] [US3] Create VillageTable component in src/components/village/VillageTable.tsx (sortable/filterable table using TanStack Table v8)
- [ ] T046 [P] [US3] Implement sorting functionality in VillageTable component (sort by population, disease count, screening coverage, etc.)
- [ ] T047 [P] [US3] Implement filtering functionality in VillageTable component (filter by disease type, min screening coverage, population range)
- [ ] T048 [P] [US3] Add sort indicators to VillageTable columns (show current sort field and direction)
- [ ] T049 [US3] Create ComparisonView component in src/components/village/ComparisonView.tsx (side-by-side comparison of selected villages)
- [ ] T050 [US3] Add village selection mechanism (checkboxes/multi-select) in VillageList and VillageTable
- [ ] T051 [US3] Implement comparison mode toggle in VillageHealthDashboard page (switches between list and comparison views)
- [ ] T052 [US3] Add export functionality in src/utils/villageExport.ts (export village health summary to CSV/PDF)
- [ ] T053 [US3] Add print-friendly styling for village health reports

**Checkpoint**: All user stories should now be independently functional. Users can compare villages and identify priorities.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Add comprehensive error logging in src/services/villageHealth.ts (log query failures, session errors, data inconsistencies)
- [ ] T055 [P] Implement query result caching in src/hooks/useVillageHealth.ts (5-minute cache to balance freshness and performance)
- [ ] T056 [P] Add accessibility attributes to all components (ARIA labels, keyboard navigation, screen reader support)
- [ ] T057 [P] Add Thai language support with proper number/date formatting in src/utils/villageFormatters.ts
- [ ] T058 Performance optimization - implement React.memo for VillageCard, VillageDetail components
- [ ] T059 Performance optimization - add useMemo for chart data transformations in PopulationChart and DiseaseChart
- [ ] T060 Add unit tests for data formatters in tests/unit/utils/villageFormatters.test.ts
- [ ] T061 Add component tests for ComparisonView in tests/component/village/ComparisonView.test.tsx
- [ ] T062 Add integration test for error recovery flows in tests/integration/villageErrorHandling.test.tsx
- [ ] T063 Add API contract test for all query error scenarios in tests/api/villageHealthErrors.test.ts
- [ ] T064 Run test suite and verify 80% code coverage minimum per Constitution Principle III
- [ ] T065 Update CLAUDE.md with village health dashboard documentation
- [ ] T066 Validate quickstart.md scenarios work as documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 components but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1/US2 but independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD per Constitution Principle II)
- Transformers/validators before services
- Services before components
- Core components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can run in parallel

**Foundational Phase (Phase 2)**:
- T006, T007 can run in parallel

**User Story 1 Tests**:
- T010, T011, T012, T013, T014, T015 can run in parallel

**User Story 1 Implementation**:
- T017, T018 can run in parallel
- T019 depends on T017
- T020 depends on T019

**User Story 2 Tests**:
- T027, T028, T029, T030, T031 can run in parallel

**User Story 2 Implementation**:
- T033, T034 can run in parallel
- T037 depends on T033
- T038, T039 can run in parallel

**User Story 3 Tests**:
- T042, T043, T044 can run in parallel

**User Story 3 Implementation**:
- T045, T046, T047 can run in parallel
- T048 depends on T046
- T049 depends on T050

**Polish Phase (Phase 6)**:
- T054, T055, T056, T057 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first, ensure they fail):
Task: "Unit test for buildPopulationQuery in tests/unit/services/villageHealth.test.ts"
Task: "Unit test for toVillageSummary transformer in tests/unit/utils/villageDataTransformers.test.ts"
Task: "Unit test for validateVillageSummary in tests/unit/utils/villageHealthValidation.test.ts"
Task: "API contract test for population query in tests/api/villageHealthQueries.test.ts"
Task: "Component test for VillageCard in tests/component/village/VillageCard.test.tsx"
Task: "Component test for VillageList in tests/component/village/VillageList.test.tsx"

# After tests fail (RED phase), launch components in parallel:
Task: "Create VillageCard component in src/components/village/VillageCard.tsx"
Task: "Create PopulationChart component in src/components/village/PopulationChart.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**MVP delivers**: Village population overview with demographics - immediately valuable for operational planning

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

**Delivery timeline**:
- After US1: Population overview available
- After US2: Health statistics and screening coverage added
- After US3: Comparison and prioritization tools added

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Population Overview)
   - Developer B: User Story 2 (Health Statistics)
   - Developer C: User Story 3 (Comparison Tools)
3. Stories complete and integrate independently

---

## Notes

- **TDD is NON-NEGOTIABLE** per Constitution Principle II: Write test → Confirm fails → Implement → Confirm passes → Refactor
- **4 test layers REQUIRED** per Constitution Principle III: Unit (80% min), Component, Integration, API Contract
- [P] tasks = different files, no dependencies
- [US1], [US2], [US3] labels map tasks to user stories for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group (Constitution Principle VIII)
- Stop at any checkpoint to validate story independently
- All SQL queries use parameterized inputs (:param_name) per FR-017
- Privacy protection for small villages enforced per data-model.md

---

## Summary

- **Total Tasks**: 66 tasks
- **Setup**: 4 tasks
- **Foundational**: 5 tasks (BLOCKS all user stories)
- **User Story 1 (P1)**: 17 tasks (6 tests + 11 implementation) - MVP
- **User Story 2 (P2)**: 16 tasks (6 tests + 10 implementation)
- **User Story 3 (P3)**: 12 tasks (3 tests + 9 implementation)
- **Polish**: 12 tasks

**Parallel Opportunities Identified**: 20+ tasks can run in parallel within their phases

**Independent Test Criteria**:
- US1: Navigate to dashboard, view village list with population demographics
- US2: View health statistics and screening coverage per village
- US3: Sort/filter villages, compare multiple villages side-by-side

**Suggested MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) = 26 tasks
