/**
 * Admin export function for all practice questions with quality metrics.
 * Run: npx convex run admin/exportQuestions:exportAllQuestions --admin
 */

import { query } from '../_generated/server';
import { v } from 'convex/values';
import { requireAdmin } from '../lib/authorization';

export const exportAllQuestions = query({
	args: {},
	handler: async (ctx) => {
		await requireAdmin(ctx);

		const questions = await ctx.db.query('practiceQuestions').collect();

		const stats = {
			totalQuestions: questions.length,
			byTrackCode: {} as Record<string, number>,
			byQuestionType: {} as Record<string, number>,
			qualityIssues: [] as Array<{
				order: number;
				trackCode: string;
				issue: string;
			}>,
			sourceUrlStats: {
				total: 0,
				withUrls: 0,
				missingUrls: 0,
				averageUrlsPerQuestion: 0
			},
			explanationStats: {
				total: 0,
				tooShort: 0, // < 20 chars
				tooLong: 0, // > 3000 chars
				missing: 0
			}
		};

		// Analyze each question
		for (const q of questions) {
			// Track code distribution
			stats.byTrackCode[q.trackCode] = (stats.byTrackCode[q.trackCode] ?? 0) + 1;

			// Question type distribution
			const qType = q.questionType ?? 'single';
			stats.byQuestionType[qType] = (stats.byQuestionType[qType] ?? 0) + 1;

			// Source URL validation
			stats.sourceUrlStats.total++;
			if (!q.sourceUrls || q.sourceUrls.length === 0) {
				stats.sourceUrlStats.missingUrls++;
				stats.qualityIssues.push({
					order: q.order,
					trackCode: q.trackCode,
					issue: 'Missing sourceUrls'
				});
			} else {
				stats.sourceUrlStats.withUrls++;
			}

			// Explanation validation
			if (!q.explanation) {
				stats.explanationStats.missing++;
				stats.qualityIssues.push({
					order: q.order,
					trackCode: q.trackCode,
					issue: 'Missing explanation'
				});
			} else {
				stats.explanationStats.total++;
				if (q.explanation.length < 20) {
					stats.explanationStats.tooShort++;
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: `Explanation too short (${q.explanation.length} chars)`
					});
				}
				if (q.explanation.length > 3000) {
					stats.explanationStats.tooLong++;
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: `Explanation too long (${q.explanation.length} chars)`
					});
				}
			}

			// Validate question type specific fields
			if (qType === 'multi') {
				if (!q.correctIndexes || q.correctIndexes.length < 2) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: 'Multi-select missing or invalid correctIndexes'
					});
				}
			} else if (qType === 'match') {
				if (!q.matchLeftItems || !q.matchRightItems) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: 'Match question missing matchLeftItems or matchRightItems'
					});
				}
				if (!q.correctMatches || q.correctMatches.length === 0) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: 'Match question missing correctMatches'
					});
				}
			}

			// Validate choices
			if (qType !== 'match') {
				if (!q.choices || q.choices.length < 2) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: `Invalid choices count (${q.choices?.length ?? 0})`
					});
				}
				if (q.correctIndex < 0 || q.correctIndex > (q.choices?.length ?? 0) - 1) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: `correctIndex ${q.correctIndex} out of range for ${q.choices?.length ?? 0} choices`
					});
				}
			}

			// Check for duplicate choices
			if (q.choices && q.choices.length > 0) {
				const normalized = q.choices.map((c) => c.trim().toLowerCase());
				const unique = new Set(normalized);
				if (unique.size !== normalized.length) {
					stats.qualityIssues.push({
						order: q.order,
						trackCode: q.trackCode,
						issue: 'Duplicate choices detected'
					});
				}
			}
		}

		// Calculate averages
		if (stats.sourceUrlStats.total > 0) {
			const totalUrls = questions.reduce((sum, q) => sum + (q.sourceUrls?.length ?? 0), 0);
			stats.sourceUrlStats.averageUrlsPerQuestion =
				Math.round((totalUrls / stats.sourceUrlStats.total) * 100) / 100;
		}

		return {
			exportedAt: new Date().toISOString(),
			stats,
			questions: questions.map((q) => ({
				trackCode: q.trackCode,
				order: q.order,
				prompt: q.prompt.substring(0, 100), // First 100 chars
				questionType: q.questionType ?? 'single',
				choiceCount: q.choices?.length ?? 0,
				hasSourceUrls: (q.sourceUrls?.length ?? 0) > 0,
				sourceUrlCount: q.sourceUrls?.length ?? 0,
				explanationLength: q.explanation?.length ?? 0,
				hasExplanation: !!q.explanation
			}))
		};
	}
});
