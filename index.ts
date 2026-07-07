#!/usr/bin/env node

import {marked} from 'marked';

async function readStdin(): Promise<string> {
  let markdown = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    markdown += chunk;
  }

  if(!markdown) {
    console.error('Usage: echo "<markdown>" | m2m');
    process.exit(1);
  }

  return markdown;
}

async function convertToHtml(markdown: string): Promise<string> {
  return await marked(markdown);
}

const markdown = await readStdin();
const html = await convertToHtml(markdown);

process.stdout.write(html);
