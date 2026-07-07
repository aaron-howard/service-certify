import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 8) return 'Architecture and Deployment';
	if (order <= 18) return 'KPI Design and Strategy';
	if (order <= 33) return 'Configure Indicators and Indicator Sources';
	if (order <= 48) return 'Configure Breakdowns and Breakdown Sources';
	if (order <= 57) return 'Data Collection';
	if (order <= 64) return 'Data Governance and Quality';
	if (order <= 79) return 'Data Visualization and Dashboards';
	if (order <= 85) return 'Advanced Analytics';
	return 'Administration and Advanced Implementation Solutions';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-pa-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-PA') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
