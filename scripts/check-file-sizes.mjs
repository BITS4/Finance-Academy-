import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const directories = ['src', 'server'];
const supported = new Set(['.js', '.jsx', '.ts', '.tsx']);
const limit = 500;
const violations = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(path);
    } else if (supported.has(extname(path)) && !/\.(spec|test)\.[jt]sx?$/.test(path)) {
      const lines = (await readFile(path, 'utf8')).split(/\r?\n/).length;
      if (lines > limit) violations.push({ path: relative(root, path), lines });
    }
  }
}

for (const directory of directories) await inspect(join(root, directory));
if (violations.length > 0) {
  for (const violation of violations) {
    process.stderr.write(`${violation.path}: ${violation.lines} lines (limit ${limit})\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(`All source files are at or below ${limit} lines.\n`);
}
