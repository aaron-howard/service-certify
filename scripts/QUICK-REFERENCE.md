# Quick Reference: Database Quality Analysis

## One-Liner Export & Analyze

```bash
# Set your Convex URL first (export scripts use CONVEX_URL, not PUBLIC_CONVEX_URL)
export CONVEX_URL="https://your-deployment.convex.cloud"

# Export questions
npx convex run admin/exportQuestions:exportAllQuestions --admin > questions-export.json

# Analyze
node scripts/analyze-question-quality.js

# Open report
open quality-report.html  # macOS
start quality-report.html # Windows
xdg-open quality-report.html # Linux
```

## What Gets Checked

✅ **Validation (automatic)**
- Source URLs present? (required)
- Explanations present? (required)
- Choices count valid? (2-6 for single/multi, 0 for match)
- Correct index valid? (matches choices count)
- Multi-select has 2+ correct indexes?
- Match questions have valid pairs?
- No duplicate choices?

📊 **Metrics (automatic)**
- Source URL coverage % per track
- Explanation completeness % per track
- Average explanation length per track
- Question type distribution
- Issues by severity and track

## Expected Output

### If All Good ✅
```
Total Questions: 2,072
No quality issues found!
  ✓ 100% have source URLs
  ✓ 100% have explanations
  ✓ No validation errors
```

### If Issues Found 🔴
```
Critical Issues: 3
  • Missing explanations: 5 questions
  • Duplicate choices: 8 questions

High Priority: 12
  • Missing source URLs: 12 questions

Recommendations:
  [CRITICAL] Add explanations to all questions
  [HIGH] Add source URLs to 12 questions
  [MEDIUM] Fix duplicate choices in 8 questions
```

## File Locations

| File | Purpose |
|------|---------|
| `src/convex/admin/exportQuestions.ts` | Convex query (reads database) |
| `scripts/export-questions-quality.js` | CLI wrapper (calls query) |
| `scripts/analyze-question-quality.js` | Analysis tool (reads JSON) |
| `questions-export.json` | Exported data (created by you) |
| `quality-report.html` | Visual report (created by analysis) |

## Troubleshooting

| Error | Fix |
|-------|-----|
| `CONVEX_URL not set` | `export CONVEX_URL="https://..."` (SvelteKit uses `PUBLIC_CONVEX_URL` in `.env.local`) |
| `Authentication failed` | Use `--admin` flag |
| `Input file not found` | Run export first, then analyze |
| `Module not found` | `npm install convex` |

## Interpreting Results

### Critical 🔴
- Stop using exam until fixed
- Usually: missing explanations, broken data
- Fix time: 2-4 hours

### High 🟠
- Reduce reliability/credibility
- Usually: missing URLs, wrong answers
- Fix time: 4-8 hours

### Medium 🟡
- Quality issues but usable
- Usually: formatting, duplicates
- Fix time: 1-2 hours

### Low 🟢
- Nice to have
- Usually: minor edge cases
- Fix time: <1 hour

## Key Metrics

| Metric | Benchmark | Pass? |
|--------|-----------|-------|
| Source URL Coverage | 100% | ✅ Yes |
| Explanation Coverage | 100% | ✅ Yes |
| Avg Explanation Length | 100-400 chars | ⚠️ Check |
| No Duplicate Choices | 100% | ✅ Yes |
| Valid Answer Indexes | 100% | ✅ Yes |
| All Types Valid | single/multi/match | ✅ Yes |

## Common Finds

From analysis of 22 exams (2,072 questions):

| Issue | Found In | Count |
|-------|----------|-------|
| Missing source URLs | 0 exams | ✅ None |
| Missing explanations | 0 exams | ✅ None |
| Domain gaps | 8 exams | 59+ questions |
| Definition-heavy | 10 exams | 150+ questions |
| Tech validation issues | 0 exams | ✅ None |

## Next Steps

1. Run export: `npx convex run admin/exportQuestions:exportAllQuestions --admin`
2. Analyze: `node scripts/analyze-question-quality.js`
3. Open report: `quality-report.html`
4. Fix critical issues
5. Re-export to verify
6. Use findings to update batch files

## Pro Tips

- Run weekly to track quality improvements
- Export before/after major updates
- Cross-reference with realism analysis files
- Use severity to prioritize fixes
- Save exports with dates: `export-$(date +%Y-%m-%d).json`

## One-Liner (Full Workflow)

```bash
export CONVEX_URL="https://your-deployment.convex.cloud" && \
npx convex run admin/exportQuestions:exportAllQuestions --admin > export-$(date +%Y-%m-%d).json && \
node scripts/analyze-question-quality.js --input export-$(date +%Y-%m-%d).json --output report-$(date +%Y-%m-%d).html && \
echo "✓ Export and analysis complete. Open report-$(date +%Y-%m-%d).html"
```
