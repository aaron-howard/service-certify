import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 23) return 'CSM Foundational Data Model';
	if (order <= 57) return 'CSM Configuration';
	if (order <= 72) return 'Case Management';
	if (order <= 79) return 'CSM Workspace Portals Analytics and Reporting';
	return 'CSM Best Practices and Knowledge Management';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-csm-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-CSM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
