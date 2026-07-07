# Database Question Quality Analysis Guide

This guide explains how to export and analyze all practice questions from your Convex database to assess quality, identify gaps, and generate recommendations.

## Quick Start (3 steps)

### Step 1: Set Environment Variable

```bash
# Get your Convex deployment URL from your project settings
export CONVEX_URL="https://your-deployment-id.convex.cloud"

# On Windows (PowerShell):
$env:CONVEX_URL = "https://your-deployment-id.convex.cloud"
```

**Where to find CONVEX_URL:**
- Go to your Convex Dashboard
- Navigate to your project
- Copy the Deployment URL (looks like `https://xyz123.convex.cloud`)

### Step 2: Export All Questions

```bash
# Run the export query with admin access
npx convex run admin/exportQuestions:exportAllQuestions --admin > questions-export.json

# This will create a JSON file with:
# - All questions from all tracks
# - Quality metrics and validation results
# - Issue summary and statistics
```

### Step 3: Analyze Quality

```bash
# Analyze the exported data
node scripts/analyze-question-quality.js

# This generates:
# - quality-report.html (visual report in browser)
# - Console output with summary and recommendations
```

---

## What Gets Checked

### ✅ Automatic Validation

The export script validates every question against the schema:

| Check | What It Validates |
|-------|---|
| **Source URLs** | Every question should have 1-10 URLs (10-500 chars each) |
| **Explanations** | Must be 20-3000 characters |
| **Question Type** | Valid: `single`, `multi`, `match` |
| **Choices** | 2-6 options for single/multi; empty for match |
| **Correct Indexes** | Multi-select must have 2+ correct answers |
| **Match Pairs** | Must have valid left/right pairings |
| **Duplicate Choices** | Detects if same answer appears twice |
| **Answer Validity** | correctIndex must be valid for choices array |

### 📊 Quality Metrics Generated

```
📚 By Track Code
  - Total questions per exam
  - Distribution across question types
  
🔗 Source URL Coverage
  - % of questions with URLs
  - Missing URL count
  - Average URLs per question
  
📝 Explanation Quality
  - % of questions with explanations
  - Count of too-short (<20 chars)
  - Count of too-long (>3000 chars)
  - Average explanation length
  
❓ Question Type Distribution
  - % single-select
  - % multi-select
  - % match questions
```

---

## Analysis Output

### Console Output Example

```
📊 QUALITY EXPORT SUMMARY
============================================================
Total Questions: 2,100
Exported at: 2026-07-06T15:30:00Z

📚 By Track Code:
  CIS-DF: 105 questions
  CIS-CSM: 90 questions
  CIS-SPM: 90 questions
  ...

❓ By Question Type:
  single: 2,050 (97.6%)
  multi: 45 (2.1%)
  match: 5 (0.2%)

🔗 Source URLs:
  With URLs: 2,100
  Missing URLs: 0
  Average per question: 1.05

📝 Explanations:
  Valid: 2,100
  Missing: 0
  Too short (<20 chars): 0
  Too long (>3000 chars): 0

⚠️  QUALITY ISSUES:
  Found 15 issues:
  • Duplicate choices detected: 8 questions
  • correctIndex out of range: 4 questions
  • Explanation too long: 3 questions
```

### HTML Report

Generates `quality-report.html` with:
- **Overview metrics** (total questions, exams, issues)
- **Issue breakdown** by severity (🔴 Critical, 🟠 High, 🟡 Medium)
- **Per-exam quality table** with coverage percentages
- **Actionable recommendations** prioritized by impact

---

## Common Issues & How to Fix Them

### Issue: "CONVEX_URL not set"

```bash
# Fix: Set the environment variable
export CONVEX_URL="https://abc123.convex.cloud"

# Verify it's set:
echo $CONVEX_URL
```

### Issue: "Authentication failed"

Make sure you:
1. Are running with `--admin` flag
2. Have access to the Convex dashboard
3. The CONVEX_URL points to your deployment

```bash
# Full command with auth:
npx convex run admin/exportQuestions:exportAllQuestions --admin
```

### Issue: "ConvexHttpClient not found"

Install Convex dependencies:

```bash
npm install convex
```

### Issue: "Input file not found" when analyzing

Make sure you ran the export first:

```bash
# Step 1: Export
npx convex run admin/exportQuestions:exportAllQuestions --admin > questions-export.json

# Step 2: Analyze
node scripts/analyze-question-quality.js
```

---

## Advanced Usage

### Export to Custom File

```bash
npx convex run admin/exportQuestions:exportAllQuestions --admin > my-export-date-2026-07-06.json
```

### Analyze Custom File

```bash
node scripts/analyze-question-quality.js --input my-export-date-2026-07-06.json --output my-report.html
```

### Verbose Output (Show All Issues)

```bash
node scripts/export-questions-quality.js --verbose --admin
node scripts/analyze-question-quality.js --verbose
```

---

## Understanding the Report

### Severity Levels

| Severity | Issue Type | Fix Time | Impact |
|----------|---|---|---|
| 🔴 **Critical** | Missing explanations, validation errors | 2-4 hrs | Exam cannot be used |
| 🟠 **High** | Missing source URLs, wrong answer indexes | 4-8 hrs | Reduced credibility |
| 🟡 **Medium** | Explanation too short/long, duplicates | 1-2 hrs | Quality issues |
| 🟢 **Low** | Minor formatting, edge cases | <1 hr | Nice to have |

### Quality Targets

| Metric | Target | Action if Below |
|--------|--------|---|
| Source URL Coverage | 100% | Add URLs to missing questions |
| Explanation Completeness | 100% | Write explanations |
| Avg Explanation Length | 100-400 chars | Review and expand/condense |
| No Duplicate Choices | 100% | Review question options |
| All Answers Valid | 100% | Fix correctIndex references |

---

## Integration with Analysis

Once you have the exported JSON, you can:

1. **Identify gaps** by exam (which domains are missing questions?)
2. **Cross-reference** with the realism analysis files (`src/lib/catalog/*Realism.ts`)
3. **Prioritize fixes** using severity and affected question count
4. **Track progress** by re-running export after fixes

### Example Workflow

```bash
# Monday: Baseline export
npx convex run admin/exportQuestions:exportAllQuestions --admin > export-monday.json
node scripts/analyze-question-quality.js --input export-monday.json --output report-monday.html

# Fix critical issues during week
# Edit questions in Convex dashboard

# Friday: Verify improvements
npx convex run admin/exportQuestions:exportAllQuestions --admin > export-friday.json
node scripts/analyze-question-quality.js --input export-friday.json --output report-friday.html

# Compare reports to see progress
```

---

## Scripts Included

### `admin/exportQuestions.ts`
Convex query that:
- Loads all practiceQuestions
- Validates each question
- Generates quality statistics
- Returns issues with line numbers

**Run with:**
```bash
npx convex run admin/exportQuestions:exportAllQuestions --admin
```

### `scripts/export-questions-quality.js`
Node.js CLI wrapper that:
- Calls the Convex query
- Saves JSON export
- Prints summary to console
- Shows top issues

**Run with:**
```bash
node scripts/export-questions-quality.js [--output FILE] [--verbose]
```

### `scripts/analyze-question-quality.js`
Analysis tool that:
- Reads exported JSON
- Categorizes issues by severity
- Generates HTML report
- Provides recommendations

**Run with:**
```bash
node scripts/analyze-question-quality.js [--input FILE] [--output FILE]
```

---

## Next Steps

After running the analysis:

1. **Review the HTML report** in your browser
2. **Identify critical issues** that block exam use
3. **Fix high-priority issues** (missing URLs, explanations)
4. **Re-export** to verify improvements
5. **Use findings** to prioritize question bank updates

---

## Questions?

The analysis output includes:
- Specific question order numbers and track codes
- Exactly what the issue is
- Recommended action
- Percentage of questions affected

Use this to guide your remediation efforts.
