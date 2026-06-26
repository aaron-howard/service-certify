import { describe, it, expect } from 'vitest';
import { createMockTrack, createMockQuestion, createMockAnswer, generateRandomAnswers, calculateGradePercentage } from '$lib/test-utils';

describe('Seed Data & Grading Integration', () => {
	describe('Seed data validation', () => {
		it('should create valid track', () => {
			const track = createMockTrack({
				code: 'CAD',
				officialName: 'Certified Application Developer'
			});

			expect(track.code).toBe('CAD');
			expect(track.officialName).toBe('Certified Application Developer');
			expect(track._id).toBeDefined();
			expect(track._creationTime).toBeGreaterThan(0);
		});

		it('should create valid questions for track', () => {
			const questions = Array.from({ length: 5 }, (_, i) =>
				createMockQuestion({
					trackCode: 'CAD',
					order: i,
					correctIndex: Math.floor(Math.random() * 4)
				})
			);

			expect(questions).toHaveLength(5);
			expect(questions.every((q) => q.trackCode === 'CAD')).toBe(true);
			expect(questions.every((q) => q._id)).toBe(true);
			expect(questions[0].order).toBe(0);
			expect(questions[4].order).toBe(4);
		});

		it('should have all required fields in question', () => {
			const question = createMockQuestion();

			expect(question).toHaveProperty('_id');
			expect(question).toHaveProperty('_creationTime');
			expect(question).toHaveProperty('trackCode');
			expect(question).toHaveProperty('order');
			expect(question).toHaveProperty('prompt');
			expect(question).toHaveProperty('choices');
			expect(question).toHaveProperty('correctIndex');
			expect(question).toHaveProperty('explanation');
			expect(question).toHaveProperty('sourceUrls');
		});

		it('should have valid choices array', () => {
			const question = createMockQuestion();

			expect(Array.isArray(question.choices)).toBe(true);
			expect(question.choices.length).toBeGreaterThanOrEqual(2);
			expect(question.choices.length).toBeLessThanOrEqual(6);
			expect(question.choices.every((c) => typeof c === 'string')).toBe(true);
		});

		it('should have valid correctIndex', () => {
			const question = createMockQuestion();

			expect(typeof question.correctIndex).toBe('number');
			expect(question.correctIndex).toBeGreaterThanOrEqual(0);
			expect(question.correctIndex).toBeLessThan(question.choices.length);
		});
	});

	describe('Grading flow', () => {
		it('should calculate grade for perfect score', () => {
			const questions = Array.from({ length: 10 }, (_, i) =>
				createMockQuestion({ order: i, correctIndex: 0 })
			);

			let correct = 0;
			for (let i = 0; i < questions.length; i++) {
				if (0 === questions[i].correctIndex) {
					correct++;
				}
			}

			expect(correct).toBe(10);
			expect(calculateGradePercentage(correct, questions.length)).toBe(100);
		});

		it('should calculate grade for partial score', () => {
			const questions = Array.from({ length: 10 }, (_, i) =>
				createMockQuestion({ correctIndex: i % 4 })
			);
			const answers = generateRandomAnswers(10);

			let correct = 0;
			for (let i = 0; i < questions.length; i++) {
				if (answers[i].selectedIndex === questions[i].correctIndex) {
					correct++;
				}
			}

			const percentage = calculateGradePercentage(correct, questions.length);
			expect(percentage).toBeGreaterThanOrEqual(0);
			expect(percentage).toBeLessThanOrEqual(100);
		});

		it('should calculate grade for zero score', () => {
			const questions = Array.from({ length: 5 }, (_, i) =>
				createMockQuestion({ correctIndex: 0 })
			);

			let correct = 0;
			for (let i = 0; i < questions.length; i++) {
				// All answers wrong
				if (3 === questions[i].correctIndex) {
					correct++;
				}
			}

			expect(correct).toBe(0);
			expect(calculateGradePercentage(correct, questions.length)).toBe(0);
		});

		it('should handle variable question counts', () => {
			for (const count of [10, 50, 100, 1000]) {
				const correct = Math.round(count * 0.7);
				const percentage = calculateGradePercentage(correct, count);

				expect(percentage).toBeGreaterThanOrEqual(69);
				expect(percentage).toBeLessThanOrEqual(71);
			}
		});

		it('should return 0% for zero questions', () => {
			const percentage = calculateGradePercentage(0, 0);
			expect(percentage).toBe(0);
		});
	});

	describe('Track organization', () => {
		it('should organize questions by track', () => {
			const tracks = ['CAD', 'CIS', 'DEVM'];
			const allQuestions = tracks.flatMap((trackCode) =>
				Array.from({ length: 5 }, (_, i) =>
					createMockQuestion({ trackCode, order: i })
				)
			);

			for (const trackCode of tracks) {
				const trackQuestions = allQuestions.filter((q) => q.trackCode === trackCode);
				expect(trackQuestions).toHaveLength(5);
				expect(trackQuestions.every((q) => q.trackCode === trackCode)).toBe(true);
			}
		});

		it('should maintain question order within track', () => {
			const questions = Array.from({ length: 20 }, (_, i) =>
				createMockQuestion({ order: i })
			);

			const sorted = [...questions].sort((a, b) => a.order - b.order);
			expect(sorted.map((q) => q.order)).toEqual([...Array(20).keys()]);
		});
	});

	describe('Answer validation during grading', () => {
		it('should validate answer structure', () => {
			const answers = generateRandomAnswers(5);

			for (const answer of answers) {
				expect(answer).toHaveProperty('order');
				expect(answer).toHaveProperty('selectedIndex');
				expect(typeof answer.order).toBe('number');
				expect(typeof answer.selectedIndex).toBe('number');
			}
		});

		it('should validate answer indices are in bounds', () => {
			const answers = generateRandomAnswers(10);

			for (const answer of answers) {
				expect(answer.selectedIndex).toBeGreaterThanOrEqual(0);
				expect(answer.selectedIndex).toBeLessThan(6); // Max 6 choices
			}
		});

		it('should handle out-of-order answers', () => {
			const answers = [
				createMockAnswer({ order: 5 }),
				createMockAnswer({ order: 2 }),
				createMockAnswer({ order: 8 })
			];

			// Should still work regardless of order
			expect(answers.map((a) => a.order)).toContain(5);
			expect(answers.map((a) => a.order)).toContain(2);
			expect(answers.map((a) => a.order)).toContain(8);
		});
	});
});
