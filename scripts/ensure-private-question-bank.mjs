#!/usr/bin/env node
/**
 * If the gitignored private question bank is missing, copy the public stub
 * so TypeScript, Vitest, and Convex codegen still resolve the import.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const privatePath = join(root, 'src/convex/seed/devQuestionBank.private.ts');
const examplePath = join(root, 'src/convex/seed/devQuestionBank.private.example.ts');

if (existsSync(privatePath)) {
	process.exit(0);
}

if (!existsSync(examplePath)) {
	console.error('Missing question-bank stub:', examplePath);
	process.exit(1);
}

copyFileSync(examplePath, privatePath);
console.warn(
	'Copied question-bank stub to src/convex/seed/devQuestionBank.private.ts (full bank is gitignored).'
);
