import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 4) return 'Initial Domain Setup and Service Provider Architecture';
	if (order <= 12) return 'MSP Operations Strategy';
	if (order <= 19) return 'Customer Onboarding and Tenant Lifecycle';
	if (order <= 34) return 'Data Separation/Visibility';
	if (order <= 53) return 'Process Separation';
	if (order <= 64) return 'Foundational Data Management';
	return 'Domain Support in Applications';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-sp-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-SP') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
