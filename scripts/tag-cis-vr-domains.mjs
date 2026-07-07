import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 18) return 'VR Applications and Modules';
	if (order <= 37) return 'Getting Data into Vulnerability Response';
	if (order <= 54) return 'Tools to Manage Vulnerability Response';
	if (order <= 69) return 'Automating Vulnerability Response';
	return 'VR Dashboards and Reports';
}

const files = fs
	.readdirSync(batchesDir)
	.filter(
		(f) =>
			(f.startsWith('cis-vr-v2-batch') || f.startsWith('cis-vr-rebalance-batch')) &&
			f.endsWith('.json')
	)
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-VR') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
