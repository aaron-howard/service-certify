import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 19) return 'Incident Management';
	if (order <= 33) return 'Problem Management';
	if (order <= 49) return 'Change Management';
	if (order <= 58) return 'Service Portfolio Management';
	if (order <= 74) return 'Service Catalog and Request Management';
	if (order <= 85) return 'Configuration Management Database';
	return 'Implementation and Strategy';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-itsm-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-ITSM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
