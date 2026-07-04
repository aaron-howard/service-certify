import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEV_PRACTICE_QUESTIONS } from '../src/convex/seed/devQuestionBank.ts';

const filtered = DEV_PRACTICE_QUESTIONS.filter(
	(q) => !(q.trackCode === 'CIS-EM' && q.order >= 60)
);
const removed = DEV_PRACTICE_QUESTIONS.length - filtered.length;
const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src/convex/seed/devQuestionBank.ts');
const body = `import type { DevPracticeQuestionRow } from './devQuestionBank.types';

/** Dev question bank; merge batches: \`node scripts/extract-questions-from-transcripts.mjs --merge-batches\` */
export const DEV_PRACTICE_QUESTIONS: DevPracticeQuestionRow[] = ${JSON.stringify(filtered, null, '\t')};
`;
fs.writeFileSync(outPath, body, 'utf8');
console.log(`Removed ${removed} CIS-EM surplus questions; total ${filtered.length}`);
