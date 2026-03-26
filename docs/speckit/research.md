# Research: Village Health Population Dashboard

**Feature**: 001-village-health-dashboard
**Date**: 2026-03-25
**Phase**: Phase 0 - Outline & Research

## Research Tasks

This document consolidates research findings for all technical unknowns identified during planning.

### 1. HOSxP Database Schema for Village Data

**Question**: What is the exact structure of village, house, and person tables in HOSxP?

**Decision**: Use HOSxP's standard PCU (Primary Care Unit) account schema with these core tables:

- **village table**: `village_id` (PK), `village_moo` (หมู่ที่), `village_name` (ชื่อหมู่บ้าน), `address_id`
- **house table**: `house_id` (PK), `village_id` (FK), `address` (บ้านเลขที่), `road`, `latitude`, `longitude`
- **person table**: `person_id` (PK), `house_id` (FK), `cid` (13-digit ID), `pname`/`fname`/`lname`, `sex` (1=male, 2=female), `birthdate`, `death` (Y/N)

**Rationale**: These tables are the core of HOSxP's population registry system. The schema is well-documented in the HOSxPPCUAccount1Package knowledge base. Village "0" (moo='0') is reserved for out-of-area/transferred persons.

**Alternatives Considered**:
- Using patient table instead of person: Rejected because person table is the PCU population registry master, patient is hospital-specific
- Using ovst/visit tables for demographics: Rejected because those are visit-specific, not population baseline

### 2. Chronic Disease Registry Schema

**Question**: How are chronic disease patients registered and tracked in HOSxP?

**Decision**: Use the clinicmember table with disease type routing via hosxp_clinic_type_id:

- **clinicmember table**: `clinicmember_id` (PK), `hn` (FK to patient), `clinic` (disease code), `regdate`, `discharge` (Y/N), `lastvisit`
- **Disease types**: DM (001), HT (002), COPD (003), Asthma (004), TB (005), CKD (006), Cancer (007), Psychiatry (008)
- **Screening status**: `person_dm_screen_status`, `person_ht_screen_status` tables
- **Comorbidities**: `cm_dm_cmbty_screen` table with complication flags (eye, foot, kidney, cardiovascular, etc.)

**Rationale**: The clinicmember table is HOSxP's central chronic disease registry. Disease type routing follows the NCD Registry Package architecture. Screening status tables provide coverage calculation data.

**Alternatives Considered**:
- Using person_chronic table: Rejected because clinicmember is the authoritative NCD registry with richer data
- Querying ovstdiag for disease prevalence: Rejected because diagnosis codes don't confirm registration in chronic disease clinics

### 3. SQL Query Patterns for Village Statistics

**Question**: How to efficiently query population and health statistics per village?

**Decision**: Use aggregated queries with parameterized inputs following HOSxP SQL patterns:

```sql
-- Village population with demographics
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
WHERE v.village_moo != '0'  -- Exclude out-of-area
GROUP BY v.village_id, v.village_moo, v.village_name
ORDER BY v.village_moo + 0;
```

```sql
-- Chronic disease counts per village
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

**Rationale**: These queries follow HOSxP's documented SQL patterns from PCU Account Package. Use LEFT JOIN for population (include villages with zero population) and INNER JOIN for chronic diseases (only count where data exists). Age calculation uses TIMESTAMPDIFF for MySQL/MariaDB compatibility.

**Alternatives Considered**:
- Multiple round-trip queries per village: Rejected due to performance concerns with 100+ villages
- Application-side aggregation: Rejected because it would transfer excessive data

### 4. Data Visualization Strategy

**Question**: How to effectively display village health statistics for public health users?

**Decision**: Use Recharts library with these visualization types:

- **Bar charts**: Disease counts per village (horizontal bars for readability)
- **Pie charts**: Demographic breakdown (age groups, gender distribution)
- **Data tables**: Sortable/filterable village list using TanStack Table v8
- **Color coding**: Green (low prevalence), Yellow (medium), Red (high) for quick prioritization
- **Badges/Icons**: Screening coverage percentages with visual indicators

**Rationale**: Recharts is already a project dependency (001-bms-kpi-dashboard) and provides responsive, accessible charts. TanStack Table handles sorting/filtering efficiently. Color coding follows Thai public health visual conventions (green=good, red=attention needed).

**Alternatives Considered**:
- Building custom visualizations with D3.js: Rejected due to complexity and maintenance burden
- Using map-based visualization: Rejected as out of scope (GPS coordinates available but not required for MVP)

### 5. Performance Optimization Strategies

**Question**: How to ensure dashboard loads quickly with large datasets?

**Decision**: Implement multi-layered caching and query optimization:

- **Query-level**: Use aggregate functions (COUNT, SUM) in SQL, LIMIT clauses for pagination
- **API-level**: Cache query results for 5 minutes (balance freshness vs. performance)
- **Component-level**: Use React.memo for village cards, useMemo for chart data transformation
- **Data fetching**: Parallel queries for population vs. health data (independent data sets)
- **Lazy loading**: Load village details on demand (expand/collapse pattern)

**Rationale**: Constitution Principle VII requires 60s query timeout and graceful degradation. Caching strategy aligns with spec assumption that 24-hour-old data is acceptable for operational planning.

**Alternatives Considered**:
- Real-time data streaming: Rejected as out of scope and not required by spec
- Pre-computed materialized views: Rejected because we don't have write access to HOSxP database

### 6. Error Handling and User Feedback

**Question**: How to handle errors and provide informative user experience?

**Decision**: Implement comprehensive error states following Constitution Principle VI:

- **Loading states**: Skeleton screens or spinners during data fetch
- **Network errors**: User-friendly messages with retry buttons ("Cannot connect to hospital database. Check your internet connection and try again.")
- **Session errors**: Clear instruction to re-authenticate ("Your session has expired. Please refresh the page to continue.")
- **Empty states**: Guidance messages ("No villages found. Contact your administrator if this seems incorrect.")
- **Partial failures**: Graceful degradation (show population data even if health data fails)

**Rationale**: Constitution Principle VI mandates actionable error messages. BMS Session API provides specific error codes that can be mapped to user-friendly guidance.

### 7. Testing Strategy for Village Dashboard

**Question**: How to ensure comprehensive test coverage across all four layers?

**Decision**: Follow Constitution Principle III with these test categories:

**Unit Tests (80% coverage minimum)**:
- SQL query builders and parameter escaping
- Data transformation functions (age calculation, aggregation)
- Filtering/sorting logic for village list

**Component Tests**:
- VillageList renders all villages with correct data
- VillageCard displays summary statistics accurately
- VillageDetail shows expanded information on click
- Charts render with correct data and labels
- Error boundaries catch and display errors gracefully

**Integration Tests**:
- End-to-end flow: load dashboard → select village → view details
- BMS Session integration: authentication → query execution → data display
- Error recovery: session expires → user refreshes → data reloads

**API Contract Tests**:
- SQL queries execute successfully via BMS Session API
- Response parsing handles all field types correctly
- Error responses trigger appropriate user feedback

**Rationale**: Constitution Principle II requires TDD with Red-Green-Refactor cycle. All four test layers are mandatory.

### 8. Accessibility and Internationalization

**Question**: How to ensure dashboard is accessible and supports Thai language?

**Decision**:
- **Accessibility**: Use shadcn/ui components (built on Radix UI) with ARIA labels, keyboard navigation, screen reader support
- **Language**: Thai as primary language, English for technical codes (ICD-10, disease codes)
- **Date formatting**: Thai Buddhist calendar (BE = CE + 543) using date-fns with custom locale
- **Number formatting**: Thai locale for thousands separators, decimals

**Rationale**: Target users are Thai public health officers. shadcn/ui components meet WCAG 2.1 AA standards by default.

### 9. Security and Privacy Considerations

**Question**: How to protect patient privacy while displaying village statistics?

**Decision**:
- **Aggregation only**: Never display individual patient data on dashboard
- **Small village suppression**: For villages with <10 population, show "ข้อมูลน้อยเกินไป" (Data too limited) instead of exact counts
- **No CID/HN exposure**: Only use patient identifiers in SQL joins, never display
- **Parameterized queries**: Prevent SQL injection via :param_name syntax
- **Session-based auth**: Leverage existing BMS Session security (JWT tokens)

**Rationale**: Thai data protection regulations require protection of individual health information. Aggregated statistics with small-count suppression are standard practice.

**Alternatives Considered**:
- Differential privacy: Rejected as overly complex for this use case
- Anonymization: Not needed since we only display aggregates

### 10. Deployment and Monitoring

**Question**: How to deploy and monitor the village dashboard?

**Decision**:
- **Deployment**: Static build via Vite, deploy to same hosting as main dashboard
- **Environment variables**: No additional env vars needed (uses existing BMS Session config)
- **Monitoring**: Add basic analytics (page load time, query duration, error rates)
- **Feature flag**: Enable/disable dashboard via configuration if needed

**Rationale**: Reuses existing deployment infrastructure from 001-bms-kpi-dashboard. No additional infrastructure required.

## Summary of Decisions

All technical unknowns have been resolved through research. The implementation will:

1. Use HOSxP's village → house → person schema for population data
2. Use clinicmember table for chronic disease registry data
3. Execute aggregated SQL queries via BMS Session API
4. Display results using Recharts visualizations and TanStack Table
5. Implement multi-layered caching for performance
6. Provide comprehensive error handling and user feedback
7. Follow TDD with 4-layer test coverage
8. Support Thai language with proper accessibility
9. Protect privacy through aggregation and small-count suppression
10. Deploy alongside existing dashboard

**Ready for Phase 1: Design & Contracts**
