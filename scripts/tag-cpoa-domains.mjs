import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 20) return 'Strategy';
	if (order <= 36) return 'People';
	if (order <= 52) return 'Process';
	if (order <= 75) return 'Technology';
	if (order <= 86) return 'Data';
	return 'ServiceNow Governance';
}

const files = fs
	.readdirSync(batchesDir)
	.filter(
		(f) =>
			(f.startsWith('cpoa-v2-batch') || f.startsWith('cpoa-rebalance-batch')) &&
			f.endsWith('.json')
	)
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CPOA') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
