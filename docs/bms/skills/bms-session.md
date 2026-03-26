# BMS Session Skill

## Purpose

Query HOSxP hospital database using the BMS Session API. HOSxP is the most widely used hospital information system in Thailand.

## Triggers

Use this skill when the user asks to:
- "query HOSxP database"
- "connect to BMS"
- "use bms-session-id"
- "query hospital data"
- "build HOSxP dashboard"
- "access patient records"
- Mentions "BMS Session", "HOSxP", "hospital database Thailand"

## MCP Tools Available

| Tool | Purpose |
|------|--------|
| `list_tables` | List database tables with pattern filtering |
| `describe_table` | Get table structure (columns, types) |
| `query` | Execute SQL queries (read-only) |

## Usage Pattern

\`\`\`
// 1. Discover tables
list_tables({ pattern: "patient*" })

// 2. Understand structure
describe_table({ table_name: "patient" })

// 3. Execute query
query({ sql: "SELECT COUNT(*) as total FROM patient" })
\`\`\`

## Common Tables

| Table | Description |
|-------|-------------|
| patient | Patient demographics |
| opd | Outpatient visits |
| ipt | Inpatient admissions |
| doctor | Physicians |
| clinicmember | Chronic disease clinic members |
| person | Person records |
| house | House addresses |
| village | Village information |
| drugitems | Medication catalog |

## Best Practices

- Always use `LIMIT` to avoid excessive rows
- Use `pattern` parameter with `list_tables` (thousands of tables exist)
- Use parameterized queries for user input
- Try MariaDB syntax first (most HOSxP deployments)
- Respect patient privacy (data is auto-masked)
