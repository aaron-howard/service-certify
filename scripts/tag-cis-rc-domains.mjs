import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 7) return 'GRC Overview';
	if (order <= 16) return 'Governance Strategy';
	if (order <= 23) return 'Implementation Planning';
	if (order <= 35) return 'Entity Framework';
	if (order <= 55) return 'Policy and Compliance';
	if (order <= 71) return 'Risk and Advanced Risk';
	if (order <= 77) return 'Common Elements and Extended Capabilities';
	return 'Audit and Advanced Audit';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-rc-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-RC') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
