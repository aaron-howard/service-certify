#!/usr/bin/env node

/**
 * Analyze exported practice questions for quality metrics and gaps.
 *
 * Usage:
 *   node scripts/analyze-question-quality.js [--input FILE] [--output FILE]
 *
 * Options:
 *   --input FILE     Input exported JSON file (default: questions-export.json)
 *   --output FILE    Save analysis report (default: quality-report.html)
 *   --verbose        Show detailed findings
 */

const fs = require('fs');
const path = require('path');

// Parse arguments
const args = process.argv.slice(2);
let inputFile = 'questions-export.json';
let outputFile = 'quality-report.html';
let verbose = false;

for (let i = 0; i < args.length; i++) {
	if (args[i] === '--input' && args[i + 1]) {
		inputFile = args[i + 1];
		i++;
	}
	if (args[i] === '--output' && args[i + 1]) {
		outputFile = args[i + 1];
		i++;
	}
	if (args[i] === '--verbose') {
		verbose = true;
	}
}

function analyzeQualityData() {
	try {
		// Read exported data
		if (!fs.existsSync(inputFile)) {
			console.error(`Error: Input file not found: ${inputFile}`);
			console.error(
				'First run: npx convex run admin/exportQuestions:exportAllQuestions --admin > questions-export.json'
			);
			process.exit(1);
		}

		const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
		const { stats, questions } = data;

		// Analyze and categorize
		const analysis = {
			timestamp: new Date().toISOString(),
			totalQuestions: stats.totalQuestions,
			issues: {
				critical: [],
				high: [],
				medium: [],
				low: []
			},
			trackAnalysis: {},
			recommendations: []
		};

		// Track-by-track analysis
		Object.entries(stats.byTrackCode).forEach(([track, count]) => {
			const trackQuestions = questions.filter((q) => q.trackCode === track);

			const analysis_track = {
				track,
				totalQuestions: count,
				byType: {},
				qualityMetrics: {
					sourceUrlCoverage: 0,
					explanationCompleteness: 0,
					averageExplanationLength: 0
				},
				issues: []
			};

			// Type distribution
			trackQuestions.forEach((q) => {
				analysis_track.byType[q.questionType] =
					(analysis_track.byType[q.questionType] ?? 0) + 1;
			});

			// Quality metrics
			const withUrls = trackQuestions.filter((q) => q.hasSourceUrls).length;
			const withExplanation = trackQuestions.filter((q) => q.hasExplanation).length;
			const avgExplLen =
				trackQuestions.reduce((sum, q) => sum + (q.explanationLength ?? 0), 0) / count;

			analysis_track.qualityMetrics.sourceUrlCoverage = Math.round(
				(withUrls / count) * 100
			);
			analysis_track.qualityMetrics.explanationCompleteness = Math.round(
				(withExplanation / count) * 100
			);
			analysis_track.qualityMetrics.averageExplanationLength = Math.round(avgExplLen);

			// Issues
			const missingUrls = trackQuestions.filter((q) => !q.hasSourceUrls);
			const missingExp = trackQuestions.filter((q) => !q.hasExplanation);
			const shortExp = trackQuestions.filter((q) => q.explanationLength < 20);
			const longExp = trackQuestions.filter((q) => q.explanationLength > 3000);

			if (missingUrls.length > 0) {
				const severity =
					missingUrls.length > count * 0.1
						? 'high'
						: missingUrls.length > count * 0.05
							? 'medium'
							: 'low';
				analysis.issues[severity].push({
					track,
					type: 'Missing source URLs',
					count: missingUrls.length,
					percentage: Math.round((missingUrls.length / count) * 100)
				});
			}

			if (missingExp.length > 0) {
				analysis.issues.critical.push({
					track,
					type: 'Missing explanations',
					count: missingExp.length,
					percentage: Math.round((missingExp.length / count) * 100)
				});
			}

			if (shortExp.length > 0) {
				analysis.issues.low.push({
					track,
					type: 'Explanation too short',
					count: shortExp.length
				});
			}

			analysis.trackAnalysis[track] = analysis_track;
		});

		// Generate recommendations
		if (stats.sourceUrlStats.missingUrls > 0) {
			analysis.recommendations.push({
				priority: 'high',
				action: 'Add source URLs to all questions',
				affectedCount: stats.sourceUrlStats.missingUrls,
				impact: 'Students cannot verify source documentation'
			});
		}

		if (stats.explanationStats.missing > 0) {
			analysis.recommendations.push({
				priority: 'critical',
				action: 'Add explanations to all questions',
				affectedCount: stats.explanationStats.missing,
				impact: 'Cannot provide learning feedback'
			});
		}

		// Generate HTML report
		const html = generateHtmlReport(analysis, data);
		fs.writeFileSync(outputFile, html);

		console.log('\n✓ Quality analysis complete');
		console.log(`Report saved to: ${outputFile}`);

		// Print summary
		console.log('\n📊 QUALITY ANALYSIS SUMMARY');
		console.log('═'.repeat(60));
		console.log(`Total Questions Analyzed: ${analysis.totalQuestions}`);

		console.log('\n🔴 CRITICAL ISSUES:');
		if (analysis.issues.critical.length === 0) {
			console.log('  ✓ None found');
		} else {
			analysis.issues.critical.forEach((issue) => {
				console.log(`  • ${issue.track}: ${issue.type} (${issue.count} questions)`);
			});
		}

		console.log('\n🟠 HIGH PRIORITY ISSUES:');
		if (analysis.issues.high.length === 0) {
			console.log('  ✓ None found');
		} else {
			analysis.issues.high.forEach((issue) => {
				console.log(
					`  • ${issue.track}: ${issue.type} (${issue.count}/${stats.byTrackCode[issue.track]} - ${issue.percentage}%)`
				);
			});
		}

		console.log('\n💡 TOP RECOMMENDATIONS:');
		analysis.recommendations.slice(0, 3).forEach((rec) => {
			console.log(`  [${rec.priority.toUpperCase()}] ${rec.action}`);
			console.log(`    Affects: ${rec.affectedCount} questions`);
		});

		console.log('');
	} catch (error) {
		console.error('Error analyzing questions:', error.message);
		process.exit(1);
	}
}

function generateHtmlReport(analysis, fullData) {
	const criticalCount = analysis.issues.critical.length;
	const highCount = analysis.issues.high.length;
	const mediumCount = analysis.issues.medium.length;
	const lowCount = analysis.issues.low.length;

	const trackRows = Object.entries(analysis.trackAnalysis)
		.sort((a, b) => b[1].totalQuestions - a[1].totalQuestions)
		.map(
			([track, trackData]) => `
	<tr>
		<td style="border: 1px solid #ddd; padding: 10px;"><strong>${track}</strong></td>
		<td style="border: 1px solid #ddd; padding: 10px;">${trackData.totalQuestions}</td>
		<td style="border: 1px solid #ddd; padding: 10px;">
			${trackData.qualityMetrics.sourceUrlCoverage}%
			${trackData.qualityMetrics.sourceUrlCoverage < 100 ? '⚠️' : '✅'}
		</td>
		<td style="border: 1px solid #ddd; padding: 10px;">
			${trackData.qualityMetrics.explanationCompleteness}%
			${trackData.qualityMetrics.explanationCompleteness < 100 ? '⚠️' : '✅'}
		</td>
		<td style="border: 1px solid #ddd; padding: 10px;">${trackData.qualityMetrics.averageExplanationLength} chars</td>
	</tr>
`
		)
		.join('');

	return `<!DOCTYPE html>
<html>
<head>
	<title>Question Quality Report</title>
	<meta charset="utf-8">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
		h1, h2 { color: #1976d2; }
		table { width: 100%; border-collapse: collapse; margin: 20px 0; }
		.critical { background: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 10px 0; }
		.high { background: #fff3e0; border-left: 4px solid #f57c00; padding: 15px; margin: 10px 0; }
		.medium { background: #fff9c4; border-left: 4px solid #fbc02d; padding: 15px; margin: 10px 0; }
		.summary { background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0; }
		.metric { display: inline-block; margin-right: 30px; }
		.metric strong { font-size: 1.5em; }
	</style>
</head>
<body>
	<h1>Question Quality Analysis Report</h1>
	<p>Generated: ${analysis.timestamp}</p>

	<div class="summary">
		<h2>Overview</h2>
		<div class="metric">
			<strong>${analysis.totalQuestions}</strong><br/>Total Questions
		</div>
		<div class="metric">
			<strong>${Object.keys(analysis.trackAnalysis).length}</strong><br/>Exams
		</div>
		<div class="metric">
			<strong>${criticalCount}</strong><br/>Critical Issues
		</div>
		<div class="metric">
			<strong>${highCount}</strong><br/>High Priority
		</div>
	</div>

	${criticalCount > 0 ? `<div class="critical"><h3>🔴 Critical Issues (${criticalCount})</h3>` + analysis.issues.critical.map((i) => `<p>${i.track}: ${i.type} (${i.count} questions)</p>`).join('') + `</div>` : ''}

	${highCount > 0 ? `<div class="high"><h3>🟠 High Priority Issues (${highCount})</h3>` + analysis.issues.high.map((i) => `<p>${i.track}: ${i.type} (${i.count}/${fullData.stats.byTrackCode[i.track]} - ${i.percentage}%)</p>`).join('') + `</div>` : ''}

	<h2>Exam-by-Exam Quality Metrics</h2>
	<table style="border: 1px solid #ddd;">
		<tr style="background: #f5f5f5;">
			<th style="border: 1px solid #ddd; padding: 10px;">Track</th>
			<th style="border: 1px solid #ddd; padding: 10px;">Questions</th>
			<th style="border: 1px solid #ddd; padding: 10px;">URL Coverage</th>
			<th style="border: 1px solid #ddd; padding: 10px;">Explanations</th>
			<th style="border: 1px solid #ddd; padding: 10px;">Avg Explanation</th>
		</tr>
		${trackRows}
	</table>

	<h2>Recommendations</h2>
	${analysis.recommendations
		.map(
			(rec) => `
		<div style="margin: 15px 0; padding: 15px; border-left: 4px solid ${rec.priority === 'critical' ? '#d32f2f' : rec.priority === 'high' ? '#f57c00' : '#fbc02d'};">
			<strong>[${rec.priority.toUpperCase()}]</strong> ${rec.action}<br/>
			<small>Affects ${rec.affectedCount} questions • Impact: ${rec.impact}</small>
		</div>
	`
		)
		.join('')}

	<hr style="margin: 40px 0;">
	<p style="color: #666; font-size: 0.9em;">Report generated by analyze-question-quality.js</p>
</body>
</html>`;
}

analyzeQualityData();
