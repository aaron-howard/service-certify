import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 9) return 'SAM Overview and Fundamentals';
	if (order <= 20) return 'SAM Strategy and Optimization';
	if (order <= 29) return 'Implementation Planning';
	if (order <= 47) return 'Data Integrity Attributes and Sources';
	if (order <= 69) return 'Practical Management of Software Compliance';
	if (order <= 82) return 'Operational Integration of Software Processes';
	return 'Cloud and SaaS Management';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-sam-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-SAM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
