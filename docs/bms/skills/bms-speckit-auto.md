# BMS Speckit Auto Skill

## Purpose

Full automated development workflow for building BMS/HOSxP applications with TDD, specifications, and quality gates.

## Triggers

Use this skill when:
- "build an application"
- "create a dashboard"
- "develop a feature"
- "speckit"
- "bms-speckit"
- End-to-end feature development request

## Execution Steps

### Phase 1: Specification & Planning

1. **Constitution** - Establish engineering principles
2. **Specify** - Create feature specification
3. **Plan** - Create implementation plan
4. **Tasks** - Generate task breakdown
5. **Analyze** - Cross-artifact consistency analysis

### Phase 2: Implementation

1. Run `/compact` to free context
2. Run `/ralph-loop` with speckit.implement
3. Complete all tasks automatically
4. Validate with speckit.analyze

## Workflow

\`\`\`
/bms-speckit:bms-speckit-auto "feature description"
\`\`\`

This will:
1. Create specs/00X-feature-name/ directory
2. Generate all planning documents
3. Implement all tasks with TDD
4. Push to remote when complete

## Generated Files

| File | Purpose |
|------|--------|
| spec.md | Feature requirements |
| plan.md | Implementation architecture |
| tasks.md | Task breakdown |
| data-model.md | Entity definitions |
| research.md | Technical research |
| quickstart.md | Integration scenarios |
| contracts/sql-queries.md | SQL contracts |
| checklists/*.md | Quality checklists |
