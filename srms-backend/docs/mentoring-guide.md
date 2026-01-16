# SRMS Mentoring Guide

Brief guide for mentoring approach and code review process.

---

## Mentoring Approach

- **Learning-focused**: Explanations help understand *why*, not just *what*
- **Constructive**: Suggestions for improvement with alternatives
- **Progressive**: Building complexity gradually as skills improve

---

## Code Review Process

### What Gets Reviewed
- New features and refactoring
- Bug fixes and tests
- Documentation updates

### Review Focus Areas
- Code structure and Laravel conventions
- Security and authorization (role-based)
- Performance (N+1 queries, eager loading)
- Test coverage
- Documentation quality

---

## Daily Check-ins

- Daily logs in `docs/logs/` with tasks, learnings, blockers
- Review progress and plan next steps
- Use daily planning templates (`docs/templates/`)

---

## Weekly Reviews

- Review weekly goals vs actual progress
- Assess code quality improvements
- Plan next week's focus areas
- Track skill growth

---

## Monthly Assessments

- Review completed deliverables against PIP goals
- Track skills: Laravel, React, Node.js, SQL, Testing
- Measure code quality improvements
- Plan next month's focus

---

## Common Patterns

### Laravel Patterns

**Service Classes**: Extract complex logic from controllers
```php
// Use service classes for business logic
$serviceRequest = app(ServiceRequestService::class)->create($data);
```

**Policy-Based Authorization**: Use policies for role-based access
```php
// Check authorization using policies
if ($user->can('update', $serviceRequest)) { }
```

**Eager Loading**: Prevent N+1 queries
```php
// Always eager load relationships
ServiceRequest::with(['user', 'service'])->get();
```

### React Patterns

**API Client Layer**: Centralize API calls
```typescript
// Use dedicated API client, not direct axios in components
const requests = await apiClient.getServiceRequests();
```

**Custom Hooks**: Reusable logic
```typescript
// Extract API logic into custom hooks
const { requests, loading } = useServiceRequests();
```

### Anti-Patterns to Avoid

**Laravel**:
- ❌ Fat controllers (move logic to services)
- ❌ N+1 queries (always eager load)
- ❌ Raw queries (use Eloquent)
- ❌ Validation in controllers (use Form Requests)

**React**:
- ❌ API calls in components (use service layer)
- ❌ Ignoring TypeScript errors
- ❌ Not handling loading/error states

---

## Learning Resources

**Laravel**: https://laravel.com/docs/12.x  
**Filament**: https://filamentphp.com/docs  
**React**: https://react.dev  
**TypeScript**: https://www.typescriptlang.org/docs  
**Node.js**: https://nodejs.org/docs  
**PestPHP**: https://pestphp.com

---

## Success Metrics

- All tests passing
- Code follows PSR-12
- Type hints everywhere
- Documentation complete
- Can explain code decisions
- Fewer mistakes over time
