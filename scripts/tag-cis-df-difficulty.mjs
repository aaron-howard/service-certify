import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

/** Orders flagged as advanced troubleshooting or multisource depth in P1/P2. */
const ADVANCED_ORDERS = new Set([
	6, 17, 30, 31, 32, 35, 40, 50, 51, 58, 60, 66, 68, 73, 78, 84, 91
]);

/** Official-style samples and introductory mapping items stay Foundation. */
const FOUNDATION_ORDERS = new Set([20, 28, 99]);

export function difficultyForQuestion(q) {
	if (ADVANCED_ORDERS.has(q.order)) return 'Advanced';
	if (FOUNDATION_ORDERS.has(q.order)) return 'Foundation';
	if (q.questionType === 'match') return 'Foundation';
	if (q.order <= 4) return 'Foundation';
	return 'Intermediate';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-df-v2-batch') && f.endsWith('.json'))
	.sort();

const counts = { Foundation: 0, Intermediate: 0, Advanced: 0 };

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-DF') continue;
		q.contentDifficulty = difficultyForQuestion(q);
		counts[q.contentDifficulty]++;
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}

console.log('Difficulty distribution:', counts);
