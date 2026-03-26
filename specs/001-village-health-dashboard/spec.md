# Feature Specification: Village Health Population Dashboard

**Feature Branch**: `001-village-health-dashboard`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "ค้นหาข้อมูลรายละเอียดการออกแบบระบบและคำสั่ง SQL จาก knowledge ของ HOSxP ในส่วนของประกรในเขตรับผิดชอบ และสร้าง dashboard ใหม่เพิ่มอีก 1 หน้า แสดงข้อมูลของประชากร แยกรายหมู่บ้าน และข้อมูลสรุปปัญหาทางด้านสุขภาพที่น่าสนใจของแต่ละหมู่บ้าน"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Village Population Overview (Priority: P1)

As a public health officer or hospital administrator, I want to view a comprehensive overview of population demographics organized by village so that I can quickly understand the population distribution across different communities in my service area.

**Why this priority**: This is the foundational view that provides context for all other health data. Without understanding the baseline population distribution, health statistics cannot be properly interpreted or prioritized.

**Independent Test**: Can be fully tested by navigating to the village health dashboard page and verifying that all villages are displayed with their population counts, demographic breakdowns (age groups, gender distribution), and basic household information. Delivers immediate value for operational planning and resource allocation.

**Acceptance Scenarios**:

1. **Given** a user with valid BMS Session ID, **When** they navigate to the village health dashboard page, **Then** they see a list of all villages in their service area with total population counts
2. **Given** the village list is displayed, **When** a village is selected, **Then** the system displays detailed demographic breakdown including age groups (0-14, 15-59, 60+), gender distribution (male/female), and household count
3. **Given** a village with zero population (out-of-area/transferred), **When** it appears in the list, **Then** it is clearly marked as "Out of Area" or "Transferred" with visual distinction
4. **Given** the data is loading, **When** the user views the page, **Then** a loading indicator is displayed until data retrieval completes
5. **Given** data retrieval fails, **When** an error occurs, **Then** an actionable error message is displayed explaining the failure and suggesting retry options

---

### User Story 2 - Analyze Health Issues by Village (Priority: P2)

As a public health officer, I want to see summary statistics of prevalent health problems for each village (especially chronic diseases like diabetes, hypertension, and other NCDs) so that I can identify high-risk communities and prioritize intervention programs accordingly.

**Why this priority**: Health issue analysis enables targeted public health interventions. This builds upon the population overview by adding health context, allowing users to identify which villages need specific health programs or increased medical resources.

**Independent Test**: Can be fully tested by viewing health statistics displayed alongside or within each village's detail, verifying that chronic disease counts (DM, HT, COPD, Asthma, CKD, Cancer, TB, Psychiatry) are shown per village with screening coverage percentages. Delivers value by highlighting communities requiring immediate attention.

**Acceptance Scenarios**:

1. **Given** a user views the village dashboard, **When** health data is displayed, **Then** each village shows counts of patients with chronic diseases (DM, HT, COPD, Asthma, CKD, Cancer, TB, Psychiatry)
2. **Given** a village is selected, **When** detailed health view is shown, **Then** screening coverage percentages are displayed for DM and HT (number screened vs. total eligible population)
3. **Given** a village with high disease prevalence, **When** it is displayed, **Then** visual indicators (color coding, icons, or badges) highlight it as a high-priority area
4. **Given** comorbidity data is available, **When** viewing a village with DM/HT patients, **Then** the system displays counts of patients with complications (eye, foot, kidney, cardiovascular, cerebrovascular, peripheral vascular, dental)
5. **Given** recent screening data exists, **When** displayed, **Then** the system shows the date of last comprehensive screening for each disease category

---

### User Story 3 - Compare Villages and Identify Priorities (Priority: P3)

As a hospital administrator or public health manager, I want to compare health metrics across multiple villages simultaneously so that I can make data-driven decisions about resource allocation and identify which communities need mobile clinics, health education campaigns, or additional medical staff.

**Why this priority**: Comparative analysis enables strategic decision-making and resource optimization. This advanced feature helps users prioritize interventions and measure the effectiveness of public health programs across different communities.

**Independent Test**: Can be fully tested by using comparison features (side-by-side village views, sorting by health metrics, filtering by disease prevalence) to identify top-priority villages. Delivers value by facilitating evidence-based planning and performance monitoring.

**Acceptance Scenarios**:

1. **Given** a user views the village dashboard, **When** they sort villages by any metric (population, disease count, screening coverage), **Then** the list reorders accordingly with clear sort indicators
2. **Given** multiple villages are being compared, **When** the user views comparison mode, **Then** key metrics (population, disease counts, screening rates) are displayed in a comparable table or chart format
3. **Given** filter options are available, **When** the user applies filters (e.g., "show only villages with >50% DM screening coverage"), **Then** the village list updates to show only matching villages
4. **Given** visualizations are displayed, **When** viewing comparison data, **Then** charts (bar charts for disease counts, pie charts for demographics) render correctly with appropriate labels and legends
5. **Given** the user identifies a priority village, **When** they select it, **Then** they can export or print the village's health summary report for planning purposes

---

### Edge Cases

- What happens when a village has no registered population (all residents transferred out)?
- How does the system handle villages with incomplete or missing demographic data?
- What happens when a patient belongs to village "0" (out of area) - should they be included in village statistics or excluded?
- How does the system display data when a patient is deceased but still registered in a village?
- What happens when BMS Session expires while viewing the dashboard - does it auto-refresh or require manual reconnection?
- How are villages with very small populations (<10 people) displayed to protect patient privacy?
- What happens when clinicmember records exist but person records are missing (data inconsistency)?
- How does the system handle patients with multiple chronic diseases - are they counted once per disease or once overall?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve and display a list of all villages within the hospital's service area using the `village` table
- **FR-002**: System MUST calculate and display total population count per village by counting living persons (death='N') linked to houses in each village via the `person` and `house` tables
- **FR-003**: System MUST display demographic breakdown per village including age groups (0-14 years, 15-59 years, 60+ years) derived from person birthdate
- **FR-004**: System MUST display gender distribution (male/female) per village using the `sex` field from the `person` table
- **FR-005**: System MUST display household count per village using the `house` table linked to each village
- **FR-006**: System MUST retrieve and display chronic disease patient counts per village for all NCD types: Diabetes (DM), Hypertension (HT), COPD, Asthma, TB, Chronic Kidney Disease (CKD), Cancer, and Psychiatry using the `clinicmember` table
- **FR-007**: System MUST calculate and display screening coverage percentages for DM and HT per village (screened patients / total eligible population × 100)
- **FR-008**: System MUST display comorbidity complication counts per village (eye, foot, kidney, cardiovascular, cerebrovascular, peripheral vascular, dental) for DM/HT patients using `cm_dm_cmbty_screen` table
- **FR-009**: System MUST visually highlight villages with high disease prevalence using color coding or badges (thresholds to be defined based on local epidemiology data)
- **FR-010**: System MUST allow users to sort the village list by any displayed metric (population, disease count, screening coverage, etc.)
- **FR-011**: System MUST allow users to filter villages based on criteria such as minimum disease count, screening coverage threshold, or population range
- **FR-012**: System MUST provide detailed view for individual villages showing all demographics and health metrics in an expandable or drill-down interface
- **FR-013**: System MUST exclude or clearly mark village "0" (moo=0) as "Out of Area" or "Transferred" to distinguish from active villages
- **FR-014**: System MUST exclude deceased persons (death='Y') from all population counts and health statistics
- **FR-015**: System MUST display loading indicators during data retrieval and provide actionable error messages if queries fail
- **FR-016**: System MUST cache query results appropriately to balance data freshness with performance
- **FR-017**: System MUST use parameterized SQL queries with `:param_name` syntax to prevent SQL injection
- **FR-018**: System MUST handle BMS Session authentication by extracting database connection details from the session response

### Key Entities

- **Village**: A geographic/administrative area representing a community (moo) within the hospital's service area. Key attributes include village ID, village number (moo), village name, and address. Related to houses and persons.

- **Person**: An individual registered in the hospital system. Key attributes include person ID, hospital number (HN), citizenship ID (CID), name (prefix, first, last), birthdate, sex, and death status. Linked to houses and villages.

- **House**: A residential dwelling unit. Key attributes include house ID, house number, and village ID. Serves as the link between persons and villages.

- **Chronic Disease Registration (clinicmember)**: A patient registered in a chronic disease clinic. Key attributes include clinic member ID, hospital number, clinic type (DM, HT, COPD, etc.), registration date, discharge status, last visit date, and comorbidity flags. Linked to person/patient records.

- **Screening Status**: Records indicating whether a person has been screened for specific chronic diseases (DM, HT, stroke, obesity). Used to calculate screening coverage rates.

- **Comorbidity Screening**: Detailed screening records for DM/HT complications including eye, foot, kidney, cardiovascular, cerebrovascular, peripheral vascular, and dental screenings.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can load and view the complete village health dashboard with all population and health statistics within 10 seconds on a standard internet connection
- **SC-002**: Dashboard accurately displays real-time data from the HOSxP database with 95% data freshness (data no older than 24 hours for critical metrics)
- **SC-003**: Users can successfully identify the top 3 villages with highest chronic disease burden within 2 minutes of using the dashboard
- **SC-004**: 90% of users can locate and interpret screening coverage data for any specific village without needing additional training
- **SC-005**: The dashboard handles service areas with up to 100 villages and 50,000 total population without performance degradation
- **SC-006**: Users can export village health summary data (CSV or PDF format) for offline use in report generation
- **SC-007**: Comparative analysis features (sorting, filtering, side-by-side comparison) reduce the time required to identify priority villages for intervention by at least 50% compared to manual data analysis
- **SC-008**: Error messages provide clear guidance 100% of the time when data retrieval fails, enabling users to understand whether the issue is network-related, session-related, or server-related
- **SC-009**: The dashboard displays health statistics for all 8 NCD types (DM, HT, COPD, Asthma, TB, CKD, Cancer, Psychiatry) with accurate counts verified against database queries
- **SC-010**: Users can navigate from population overview to detailed health view for any village in 3 or fewer clicks/taps

## Assumptions

1. **Data Availability**: The HOSxP database contains complete and accurate records for persons, houses, villages, and clinicmember registrations. Some data inconsistencies may exist (e.g., missing person records for clinicmember entries) but will not significantly impact overall statistics.

2. **Village Structure**: All villages within the hospital's service area are properly defined in the `village` table with valid village IDs and names. Village "0" represents out-of-area/transferred persons and should be handled distinctly.

3. **Chronic Disease Classification**: Chronic diseases are categorized according to HOSxP's `clinic` table and `hosxp_clinic_type_id` routing system. The 8 main NCD types (DM, HT, COPD, Asthma, TB, CKD, Cancer, Psychiatry) cover the majority of chronic disease burden in Thai communities.

4. **Screening Coverage Calculation**: Eligible population for DM/HT screening includes adults aged 15-59 years as per Thai public health guidelines. Screening coverage is calculated as (screened persons / eligible persons) × 100.

5. **Privacy Thresholds**: Villages with very small populations (<10 people) may have aggregated or suppressed display to protect patient privacy, in accordance with Thai data protection regulations.

6. **Data Freshness**: Real-time data is not required; data refreshed within the last 24 hours is considered sufficiently fresh for operational planning purposes. Query performance takes priority over absolute real-time accuracy.

7. **User Expertise**: Primary users are public health officers, hospital administrators, and healthcare workers familiar with basic medical terminology and demographic concepts. No special technical training beyond general computer literacy is assumed.

8. **BMS Session Integration**: The dashboard will leverage existing BMS Session infrastructure for authentication and database connectivity. No separate authentication system is required.

9. **Language Support**: The dashboard will support Thai language as primary, with English translations available for technical terms and codes.

10. **Performance Targets**: Target users have access to standard internet connections (minimum 10 Mbps). The dashboard should load and respond within acceptable timeframes for operational use (10 seconds for initial load, 2 seconds for interactions).

## Dependencies

- **BMS Session API**: Dashboard relies on BMS Session API for authentication and database connectivity. Session management must be implemented before this feature.
- **HOSxP Database Access**: Read-only SQL query access to HOSxP database tables: village, house, person, clinicmember, person_dm_screen_status, person_ht_screen_status, cm_dm_cmbty_screen, clinic, clinic_member_status.
- **UI Component Library**: Dashboard uses shadcn/ui components for consistent styling. Required components include tables, cards, badges, loading states, error displays, and visualization components (charts).
- **Data Visualization**: Recharts library for rendering charts (bar charts, pie charts) to display demographic breakdowns and health metrics.
- **Routing**: React Router or equivalent for navigation to the village dashboard page from the main application.

## Out of Scope

- Individual patient-level records or detailed patient information on the dashboard (only aggregated statistics per village)
- Real-time data streaming or live updates (dashboard uses cached data with periodic refresh)
- Patient intervention tracking or follow-up management features
- Editing or updating village/clinic data through the dashboard (read-only display)
- Mobile-responsive design optimizations (assumed desktop/tablet usage by primary users)
- Advanced statistical analysis or trend detection algorithms (basic summary statistics only)
- Integration with external public health reporting systems or MOPH data warehouses
- Multi-hospital or comparative analysis across different hospital service areas
