import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 19) return 'TPRM Fundamentals and Review';
	if (order <= 32) return 'Core Configuration';
	if (order <= 62) return 'Assessment Configuration';
	if (order <= 73) return 'Third-party Portal';
	if (order <= 84) return 'Third-party Supporting Processes';
	return 'Other Application Relationships';
}

const files = fs
	.readdirSync(batchesDir)
	.filter(
		(f) =>
			(f.startsWith('cis-tprm-v2-batch') || f.startsWith('cis-tprm-rebalance-batch')) &&
			f.endsWith('.json')
	)
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-TPRM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
