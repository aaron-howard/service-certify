#!/usr/bin/env node

/**
 * Export and analyze all practice questions from Convex database.
 *
 * Usage:
 *   node scripts/export-questions-quality.js [--output FILE] [--admin]
 *
 * Options:
 *   --output FILE    Save results to JSON file (default: questions-export.json)
 *   --admin          Run as admin (required for full data)
 *   --verbose        Show detailed progress
 */

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require('convex/browser');

// Parse arguments
const args = process.argv.slice(2);
let outputFile = 'questions-export.json';
let verbose = false;
const isAdmin = args.includes('--admin');

for (let i = 0; i < args.length; i++) {
	if (args[i] === '--output' && args[i + 1]) {
		outputFile = args[i + 1];
		i++;
	}
	if (args[i] === '--verbose') {
		verbose = true;
	}
}

async function main() {
	try {
		// Get Convex deployment URL from environment
		const convexUrl = process.env.CONVEX_URL;
		if (!convexUrl) {
			console.error('Error: CONVEX_URL environment variable not set');
			console.error('Set it with: export CONVEX_URL=https://your-deployment.convex.cloud');
			process.exit(1);
		}

		if (verbose) console.log(`Connecting to Convex: ${convexUrl}`);

		const client = new ConvexHttpClient(convexUrl);

		// Export using the admin query
		if (verbose) console.log('Exporting questions with quality metrics...');

		const result = await client.query('admin/exportQuestions:exportAllQuestions', {});

		// Save raw export
		const fullPath = path.resolve(outputFile);
		fs.writeFileSync(fullPath, JSON.stringify(result, null, 2));

		if (verbose) console.log(`✓ Exported to: ${fullPath}`);

		// Print summary
		console.log('\n📊 QUALITY EXPORT SUMMARY');
		console.log('═'.repeat(60));
		console.log(`Total Questions: ${result.stats.totalQuestions}`);
		console.log(`Exported at: ${result.exportedAt}`);

		console.log('\n📚 By Track Code:');
		Object.entries(result.stats.byTrackCode)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.forEach(([track, count]) => {
				console.log(`  ${track}: ${count} questions`);
			});

		console.log('\n❓ By Question Type:');
		Object.entries(result.stats.byQuestionType).forEach(([type, count]) => {
			const pct = Math.round((count / result.stats.totalQuestions) * 100);
			console.log(`  ${type}: ${count} (${pct}%)`);
		});

		console.log('\n🔗 Source URLs:');
		console.log(`  With URLs: ${result.stats.sourceUrlStats.withUrls}`);
		console.log(`  Missing URLs: ${result.stats.sourceUrlStats.missingUrls}`);
		console.log(`  Average per question: ${result.stats.sourceUrlStats.averageUrlsPerQuestion}`);

		console.log('\n📝 Explanations:');
		console.log(`  Valid: ${result.stats.explanationStats.total}`);
		console.log(`  Missing: ${result.stats.explanationStats.missing}`);
		console.log(`  Too short (<20 chars): ${result.stats.explanationStats.tooShort}`);
		console.log(`  Too long (>3000 chars): ${result.stats.explanationStats.tooLong}`);

		console.log('\n⚠️  QUALITY ISSUES:');
		if (result.stats.qualityIssues.length === 0) {
			console.log('  ✓ No quality issues found!');
		} else {
			console.log(`  Found ${result.stats.qualityIssues.length} issues:`);

			// Group by issue type
			const byIssueType = {};
			result.stats.qualityIssues.forEach((issue) => {
				const key = issue.issue;
				byIssueType[key] = (byIssueType[key] ?? []).concat(issue);
			});

			Object.entries(byIssueType)
				.sort((a, b) => b[1].length - a[1].length)
				.slice(0, 15)
				.forEach(([issueType, issues]) => {
					console.log(`  • ${issueType}: ${issues.length} questions`);
					if (verbose && issues.length <= 5) {
						issues.forEach((i) => {
							console.log(
								`    → ${i.trackCode}-${i.order}`
							);
						});
					}
				});
		}

		console.log(`\n✓ Full export saved to: ${fullPath}`);
		console.log('Use this file with the quality analysis script.\n');
	} catch (error) {
		console.error('Error exporting questions:', error.message);
		console.error('\nMake sure you:');
		console.error('  1. Set CONVEX_URL environment variable');
		console.error('  2. Run with --admin flag for full access');
		console.error('  3. Are authenticated to your Convex deployment');
		process.exit(1);
	}
}

main();
