#!/usr/bin/env bun

import {parseArgs as nodeParseArgs} from 'node:util';
import {marked} from 'marked';

interface Args {
  write?: string;
}

function parseArgs(argv: string[]): Args {
  try {
    const {values} = nodeParseArgs({
      args: argv,
      options: {
        'write': {type: 'string'},
      },
      strict: true
    });

    return {write: values.write};
  } catch(e) {
    console.error((e as Error).message);
    console.error('Usage: echo "<markdown>" | m2m [--write <file>]');
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  const markdown = await Bun.stdin.text();
  if(!markdown) {
    console.error('Usage: echo "<markdown>" | m2m [--write <file>]');
    process.exit(1);
  }

  return markdown;
}

async function convertToHtml(markdown: string): Promise<string> {
  return await marked(markdown);
}

async function writeToFile(html: string, path: string): Promise<void> {
  await Bun.write(path, html);
}

const args = parseArgs(process.argv.slice(2));
const markdown = await readStdin();
const html = await convertToHtml(markdown);

if(args.write) {
  await writeToFile(html, args.write);
} else {
  process.stdout.write(html);
}
