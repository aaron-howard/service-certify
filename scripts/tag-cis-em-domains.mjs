import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 3) return 'Event Management Overview';
	if (order <= 12) return 'Architecture and Discovery';
	if (order <= 28) return 'Event Configuration and Use';
	if (order <= 43) return 'Alerts and Tasks';
	if (order <= 53) return 'Event Sources';
	return 'Metric Intelligence';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-em-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-EM') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
