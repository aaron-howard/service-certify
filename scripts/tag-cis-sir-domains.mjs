import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const batchesDir = path.join(__dirname, 'question-batches');

export function domainForOrder(order) {
	if (order <= 9) return 'SIR Overview and Data Visualization';
	if (order <= 20) return 'Incident Response Strategy';
	if (order <= 29) return 'Implementation Planning';
	if (order <= 40) return 'Security Incident Creation and Threat Intelligence';
	if (order <= 53) return 'Security Incident and Threat Intelligence Integrations';
	if (order <= 66) return 'Security Incident Response Management';
	if (order <= 75) return 'Risk Calculations and Post Incident Response';
	return 'Automation and Standard Processes';
}

const files = fs
	.readdirSync(batchesDir)
	.filter((f) => f.startsWith('cis-sir-v2-batch') && f.endsWith('.json'))
	.sort();

for (const file of files) {
	const filePath = path.join(batchesDir, file);
	const rows = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	for (const q of rows) {
		if (q.trackCode !== 'CIS-SIR') continue;
		q.domain = domainForOrder(q.order);
	}
	fs.writeFileSync(filePath, `${JSON.stringify(rows, null, '\t')}\n`, 'utf8');
	console.log(`Tagged ${file} (${rows.length} questions)`);
}
