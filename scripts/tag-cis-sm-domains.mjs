import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 10) return 'Service Design Strategy';
	if (order <= 28) return 'Service Mapping Pattern Design';
	if (order <= 41) return 'Service Mapping Configuration';
	if (order <= 55) return 'Discovery Configuration';
	if (order <= 68) return 'Machine Learning';
	if (order <= 78) return 'Configuration Management Database';
	return 'Service Mapping Engagement Readiness';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-sm-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-SM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
