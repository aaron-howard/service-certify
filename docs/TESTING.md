# Testing Guide

Service Certify uses **Vitest** for fast, modern testing with TypeScript support.

**Current baseline (Jul 2026):** 45 test files, **362 tests** — run `npm test` to verify.

## Quick Start

### Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file change)
npm test -- --watch

# Run specific test file
npm test src/lib/rateLimit.test.ts

# Run tests matching a pattern
npm test -- --grep "Rate Limit"

# Generate coverage report
npm run test:coverage
```

### View UI Dashboard

```bash
npm run test:ui
# Opens browser at http://localhost:51204/__vitest__/
```

## Test Structure

Tests are located alongside source files with `.test.ts` or `.spec.ts` suffix:

```
src/
├── lib/
│   ├── rateLimit.ts
│   ├── rateLimit.test.ts    ← Tests for rateLimit
│   ├── sentry.ts
│   ├── test-utils.ts        ← Shared test utilities
│   └── ...
├── convex/
│   ├── practiceQuestions.ts
│   ├── practiceQuestions.test.ts
│   └── ...
└── routes/
    └── api/
        └── health/
            ├── +server.ts
            └── __tests__/
                └── health.test.ts
```

## Current Test Coverage

| Area | Tests |
|------|-------|
| **Rate limiting** | `rateLimit.test.ts` |
| **Practice / grading** | `practiceQuestions.test.ts`, choice shuffle, grade API |
| **Health endpoint** | `health/__tests__/health.test.ts` |
| **Question bank quality** | `devQuestionBank.test.ts`, `trackQuality.test.ts`, per-track `*Realism.test.ts` |
| **Auth / progress** | Authorization helpers, `userProgress` |

**Goal: 70%+ coverage for critical paths**

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle edge case', () => {
    expect(() => badFunction()).toThrow();
  });
});
```

### Unit Tests

Test functions in isolation:

```typescript
// src/lib/validation.ts
export function validateEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

// src/lib/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Integration Tests

Test module interactions:

```typescript
describe('Practice Session', () => {
  it('should grade answers correctly', () => {
    const questions = [
      { correctIndex: 1 },
      { correctIndex: 2 },
      { correctIndex: 0 }
    ];
    
    const answers = [
      { selectedIndex: 1 }, // correct
      { selectedIndex: 3 }, // wrong
      { selectedIndex: 0 }  // correct
    ];
    
    let correct = 0;
    for (let i = 0; i < answers.length; i++) {
      if (answers[i].selectedIndex === questions[i].correctIndex) {
        correct++;
      }
    }
    
    expect(correct).toBe(2);
    expect(correct / questions.length).toBeCloseTo(0.667, 2);
  });
});
```

### Testing Async Code

```typescript
describe('Async operations', () => {
  it('should handle promises', async () => {
    const result = await someAsyncFunction();
    expect(result).toBe(expected);
  });

  it('should catch errors', async () => {
    await expect(failingFunction()).rejects.toThrow();
  });
});
```

## Test Utilities

Reusable helpers in `src/lib/test-utils.ts`:

```typescript
import { createMockQuestion, generateRandomAnswers } from '$lib/test-utils';

describe('Grading', () => {
  it('should grade random answers', () => {
    const question = createMockQuestion({ correctIndex: 2 });
    const answers = generateRandomAnswers(10);
    
    // Test grading logic...
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(expected);        // Strict equality (===)
expect(object).toEqual(expectedObj); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Numbers
expect(value).toBeGreaterThan(0);
expect(value).toBeLessThanOrEqual(100);
expect(value).toBeCloseTo(3.14, 2); // 2 decimal places

// Strings
expect(str).toMatch(/regex/);
expect(str).toContain('substring');

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain(item);
expect(arr).toEqual([1, 2, 3]);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toEqual({ key: 'value' });

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');

// Async
await expect(promise).rejects.toThrow();
```

## Testing Convex Functions

For testing Convex queries/mutations, use mock context:

```typescript
import { createMockConvexContext, createMockQuestion } from '$lib/test-utils';

describe('listByTrackCode', () => {
  it('should list questions by track', async () => {
    const mockCtx = createMockConvexContext();
    
    // Override for your test:
    mockCtx.db.query = () => ({
      withIndex: () => ({
        collect: async () => [
          createMockQuestion({ trackCode: 'CAD' }),
          createMockQuestion({ trackCode: 'CAD' })
        ]
      })
    });
    
    // Test your function...
  });
});
```

## CI Integration

Tests run automatically in GitHub Actions (`.github/workflows/ci.yml`):

```yaml
- run: npm test
```

Failing tests block merges to `main` (via branch protection).

## Coverage Reports

Generate and view coverage:

```bash
npm run test:coverage
# Opens coverage report in coverage/index.html
```

Coverage breakdown:
- **Statements:** Code lines executed
- **Branches:** All if/else paths taken
- **Functions:** All functions called
- **Lines:** All lines executed

**Target:** 70%+ for critical paths (validation, rate limiting, grading)

## Best Practices

✅ **Do:**
- Test behavior, not implementation details
- Use descriptive test names (`should...`, `must...`)
- Keep tests small and focused (one assertion per test is ideal)
- Use beforeEach/afterEach for setup/teardown
- Mock external dependencies (Redis, Sentry, etc.)
- Test both success and error cases
- Group related tests with describe()

❌ **Don't:**
- Mock too aggressively (test real logic where possible)
- Write tests that depend on other tests
- Use hardcoded delays (setTimeout)
- Commit skip/only modifiers (.skip, .only)
- Test third-party libraries (trust their tests)

## Debugging Tests

```bash
# Run single test in watch mode
npm test -- --watch src/lib/rateLimit.test.ts

# Run with verbose output
npm test -- --reporter=verbose

# Stop on first error
npm test -- --bail

# Debug in browser (if available)
npm test -- --inspect-brk
```

## Adding New Tests

When adding features:
1. Write test first (TDD style) or alongside code
2. Test inputs (valid, invalid, edge cases)
3. Test outputs (correct type, structure, values)
4. Test errors (graceful degradation)
5. Run `npm run test:coverage` to check coverage
6. Commit tests with your feature

Example checklist:
- [ ] Tests written
- [ ] Tests pass locally (`npm test`)
- [ ] Coverage ≥70% for critical paths
- [ ] CI passes (tests run in GitHub Actions)
- [ ] No skipped/only tests left

## Phase-Specific Testing

**Current (soft-launch MVP):** Focus on critical paths
- Rate limiting utility
- Input validation
- Health endpoint
- Seed / question-bank quality gates
- Catalog + practice E2E (static / sample flows)

**Auth (extend coverage):**
- Authentication flows (WorkOS mocked UI, not live OAuth) in E2E (`tests/e2e/auth-flows.spec.ts`)
- Protected full-mock endpoints
- User progress tracking (implemented via `recordPracticeSession` on grade)
- *Note: CI tests mocked provider redirects; manual staging E2E with WorkOS test credentials available for full OAuth round-trip validation*

**Phase D (payments):** Add integration tests
- Payment processing
- Subscription management
- Billing edge cases

## Resources

- [Vitest docs](https://vitest.dev)
- [Testing Library docs](https://testing-library.com)
- [Common testing patterns](https://testingjavascript.com)

## Related

- [E2E-AND-A11Y.md](./E2E-AND-A11Y.md)
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Testing gaps
- CI/CD: `.github/workflows/ci.yml` runs tests
