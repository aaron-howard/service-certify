import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 46) return 'Strategy';
	if (order <= 78) return 'Cost/Resource Planning';
	if (order <= 121) return 'Implementation and Delivery';
	if (order <= 160) return 'ServiceNow Governance';
	if (order <= 193) return 'Compliance and Security';
	return 'Innovation';
}

const files = fs
	.readdirSync(batchesDir)
	.filter(
		(f) =>
			(f.startsWith('cpoe-v2-batch') || f.startsWith('cpoe-rebalance-batch')) &&
			f.endsWith('.json')
	)
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CPOE') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
