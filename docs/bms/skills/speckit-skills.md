# Speckit Skills Reference

## Overview

Speckit is a specification-driven development system for building high-quality applications with TDD.

## Available Skills

| Skill | Command | Purpose |
|-------|---------|---------|
| constitution | `/speckit.constitution` | Establish project engineering principles |
| specify | `/speckit.specify` | Create feature specification |
| clarify | `/speckit.clarify` | Ask clarification questions |
| plan | `/speckit.plan` | Create implementation plan |
| tasks | `/speckit.tasks` | Generate task breakdown |
| implement | `/speckit.implement` | Execute implementation |
| analyze | `/speckit.analyze` | Cross-artifact consistency analysis |
| checklist | `/speckit.checklist` | Generate quality checklist |

## Workflow Order

\`\`\`
1. /speckit.constitution  → specs/constitution.md
2. /speckit.specify     → specs/00X-feature/spec.md
3. /speckit.plan        → specs/00X-feature/plan.md
4. /speckit.tasks       → specs/00X-feature/tasks.md
5. /speckit.implement   → Execute all tasks
6. /speckit.analyze    → Validate consistency
\`\`\`

## Generated Artifacts

### Constitution (specs/constitution.md)
- Engineering principles (MUST/SHOULD)
- TDD requirements
- Testing standards
- Code quality gates

### Specification (spec.md)
- User stories
- Functional requirements
- Non-functional requirements
- Acceptance criteria

### Plan (plan.md)
- Architecture decisions
- File structure
- Tech stack
- Implementation phases

### Tasks (tasks.md)
- Task breakdown by phase
- TDD test tasks
- Implementation tasks
- Dependencies and ordering

## TDD Approach

All tasks follow Test-Driven Development:
1. **Red**: Write test, confirm it fails
2. **Green**: Implement minimum code to pass
3. **Refactor**: Improve code quality

## Test Layers Required

| Layer | Coverage | Purpose |
|-------|----------|---------|
| Unit | 80% min | Individual function testing |
| Component | All components | React component testing |
| Integration | Key flows | Cross-module testing |
| API Contract | All queries | SQL query validation |
