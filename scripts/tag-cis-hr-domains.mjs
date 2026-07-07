import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 21) return 'HR System Architecture';
	if (order <= 53) return 'Core HR Applications and Employee Center';
	if (order <= 71) return 'HR Journeys';
	if (order <= 76) return 'Platform, Role, and Contextual Security';
	if (order <= 85) return 'Integration Strategy';
	return 'Implementation and Change Management';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-hr-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-HR') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
