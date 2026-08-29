# LeadCap Design System — Phase 1

This folder introduces the first shared visual primitives without replacing the
existing components yet.

## Components

- `Surface`
- `Button`
- `Badge`
- `StatusBadge`
- `MetricCard`
- `PageHeader`
- `SectionHeader`

## Semantic status model

Keep these concepts separate:

### Risk
- `safe`
- `warning`
- `danger`

### Workflow
- `pending`
- `review`
- `verified`
- `rejected`

### Laboratory result
- `pass`
- `fail`
- `inconclusive`
- `not-tested`

Example:

```jsx
<StatusBadge status="danger" />
<StatusBadge status="verified" />
<StatusBadge status="fail" />
```

The goal is to migrate existing modules to these primitives gradually.
Do not delete the old components during Phase 1.
