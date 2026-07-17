# End-to-End & Accessibility Testing

Service Certify includes comprehensive E2E tests with Playwright and automated accessibility testing with axe-core.

## End-to-End Testing

### Quick Start

```bash
# Run E2E tests (starts dev server automatically)
npm run test:e2e

# Run E2E tests in interactive UI
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/e2e/critical-flows.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run tests in debug mode
npm run test:e2e -- --debug
```

### Test Structure

```
tests/
└── e2e/
    ├── auth-flows.spec.ts        ← Sign-in UI, full-mock gate, sample without auth
    ├── practice-exam.spec.ts     ← Practice session flows
    ├── critical-flows.spec.ts    ← Main user journeys
    └── accessibility.spec.ts     ← A11y checks (WCAG 2.1 AA)
```

### Critical User Flows Tested

1. **Landing Page**
   - Page loads and displays heading
   - Navigation is present and clickable

2. **Exam Catalog**
   - Browse all certification exam tracks
   - Exam items are visible and clickable
   - Loading states handled properly

3. **Exam Details**
   - View exam information and description
   - Practice button visible and clickable
   - No crashes on bad URLs

4. **Practice Session**
   - Questions load correctly
   - User can select answers
   - Answer state persisted
   - Submit button triggers grading

5. **Results Display**
   - Grade calculated and displayed
   - Score percentage shown
   - Explanations visible

6. **Responsive Design**
   - Mobile viewport (375x812) works correctly
   - No horizontal scrolling
   - Touch interactions work

7. **Error Handling**
   - Non-existent pages don't crash
   - Network errors handled gracefully
   - User can recover and continue

### Test Patterns

```typescript
// Navigate and interact
test('should answer questions', async ({ page }) => {
  await page.goto('/exams');
  await page.waitForLoadState('networkidle');

  const choices = page.locator('[data-testid="choice"]');
  await choices.first().click();

  // Verify state
  await expect(choices.first().locator('input')).toBeChecked();
});
```

### Playwright Features Used

- **Selectors:** data-testid, CSS, text matching
- **Waiting:** waitForLoadState, waitForSelector
- **Assertions:** toBeVisible, toHaveURL, toBeChecked
- **Viewport:** setViewportSize for responsive testing
- **Keyboard:** keyboard.press for accessibility
- **Screenshots:** auto-captured on failure

## Accessibility Testing

### Quick Start

```bash
# Run accessibility tests
npm run test:a11y

# Run all tests with accessibility checks
npm run test:e2e

# Generate HTML report
npm run test:e2e -- --reporter=html
# Open: playwright-report/index.html
```

### Automated A11y Checks

Using **axe-core** (industry-standard accessibility checker):

```typescript
import { injectAxe, checkA11y } from '@axe-core/playwright';

test('page should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  
  // Checks: WCAG 2.1 Level A & AA
  await checkA11y(page);
});
```

### WCAG 2.1 AA Compliance Checked

**Automated:**
- ✅ Color contrast ratios (4.5:1 for text, 3:1 for graphics)
- ✅ Missing alt text on images
- ✅ Form labels and associations
- ✅ Button accessible names
- ✅ Heading hierarchy
- ✅ Landmark regions (main, nav, etc.)
- ✅ ARIA attributes
- ✅ Focus indicators

**Manual (tested):**
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Screen reader compatibility (NVDA, JAWS)
- ✅ Mobile accessibility (VoiceOver, TalkBack)
- ✅ Focus order and visibility
- ✅ Skip links and landmarks

### Current A11y Status

**Target:** WCAG 2.1 AA (Level 2 compliance)

**Known Issues & Mitigations:**
- Some form inputs may need explicit labels → Adding aria-label fallbacks
- Color contrast on secondary text → Ensure 4.5:1 ratio
- Focus indicators subtle → Enhanced with visible outlines

**How to Check A11y Locally:**

1. **Browser DevTools:**
   ```
   Chrome: DevTools → Lighthouse → Accessibility
   Firefox: DevTools → Inspector → Accessibility
   ```

2. **axe DevTools Browser Extension:**
   - Download: [axe DevTools](https://www.deque.com/axe/devtools/)
   - Open DevTools → axe DevTools → Scan

3. **Screen Reader Testing:**
   - Windows: NVDA (free) or JAWS (paid)
   - Mac: VoiceOver (built-in) or JAWS
   - Test: Tab through pages, verify announcements

### Adding More A11y Tests

```typescript
// Test heading structure
test('should have proper heading hierarchy', async ({ page }) => {
  await page.goto('/');
  
  const headings = await page.locator('h1, h2, h3').all();
  // Verify h1 first, no skipped levels
});

// Test keyboard navigation
test('should be keyboard navigable', async ({ page }) => {
  await page.goto('/');
  
  await page.keyboard.press('Tab'); // Focus first element
  await expect(page.locator(':focus')).toBeVisible();
  
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab'); // Tab through
  }
});

// Test screen reader
test('should work with screen reader', async ({ page }) => {
  // Use axe or manual verification
  const role = await page.locator('button').getAttribute('role');
  expect(role === 'button' || role === null).toBe(true);
});
```

## Marking Elements for Testing

Make tests more robust by adding data-testid attributes:

```svelte
<!-- Before: brittle selector -->
<button>Practice</button>

<!-- After: resilient selector -->
<button data-testid="practice-btn">Practice</button>
```

Then use in tests:
```typescript
const btn = page.locator('[data-testid="practice-btn"]');
```

## Running Tests Together

```bash
# Unit + Integration + E2E
npm run check && npm test && npm run test:e2e

# Or in parallel (faster):
npm run test & npm run test:e2e & npm run check
```

## Debugging Tests

```bash
# Step through test in browser
npm run test:e2e -- --debug

# Pause at breakpoint
test('...', async ({ page }) => {
  await page.pause(); // Opens inspector
});

# View test video/trace
npm run test:e2e -- --headed
npm run test:e2e -- --trace on
# Open: trace.zip in https://trace.playwright.dev
```

## Performance Notes

- Tests run headless (no GUI) → ~50% faster
- **Local:** parallelized across Chromium, Firefox, and WebKit (`playwright.config.ts`)
- **CI:** Chromium only (30 spec cases); Firefox/WebKit run locally
- Each test starts fresh (isolation)
- Failed tests retry twice on CI (`retries: 2`); no retries locally

## CI/CD Integration

E2E tests run in the **`CI`** workflow as a separate job from build/unit tests:

```yaml
# .github/workflows/ci.yml (simplified; see full workflow for checkout, Node setup, etc.)
jobs:
  check-and-build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run check
      - run: npm test
      - run: npm run build
  e2e-tests:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

The **`Security audit`** workflow runs `npm audit --audit-level=moderate` as part of CI to verify dependencies.

## Known Limitations

- E2E tests require local dev server (slow for CI)
- Some browser APIs not available in headless mode
- Mobile testing limited to viewport size (not real device)
- Network requests are real (not mocked)

## Related

- [TESTING.md](./TESTING.md) — Unit & integration testing
- [PRODUCTION_READINESS_AUDIT.md](./PRODUCTION_READINESS_AUDIT.md) — Testing status (auth E2E gate covered; full OAuth round-trip not in CI)
- [Playwright docs](https://playwright.dev)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Next Steps

**Before Launch:**
1. ✅ Add data-testid to main interactive elements
2. ✅ Run `npm run test:e2e` locally
3. ✅ Fix any A11y failures
4. ✅ Test on real mobile device (if possible)
5. ✅ Auth E2E: sign-in UI, full-mock redirect gate, sample without auth (`tests/e2e/auth-flows.spec.ts`)

**Post-Launch:**
1. Monitor E2E test failures in CI
2. Add tests for new features
3. Increase coverage to ~80% critical paths
4. Schedule monthly A11y audit with tools like eShop or Monsido
5. Optional: staging E2E with WorkOS test credentials for full OAuth round-trip
