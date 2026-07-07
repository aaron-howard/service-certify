import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 13) return 'IT Asset Management Overview and Fundamentals';
	if (order <= 33) return 'Data Integrity Attributes and Data Sources';
	if (order <= 56) return 'Practical Management of IT Assets';
	if (order <= 78) return 'Operational Integration of IT Asset Management Processes';
	return 'Financial Management of IT Assets';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-ham-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-HAM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
