#!/usr/bin/env bun

import type {FileSink} from 'bun';
import {parseArgs as nodeParseArgs} from 'node:util';
import {marked} from 'marked';

interface Args {
  write?: string;
  clip: boolean;
}

function parseArgs(argv: string[]): Args {
  try {
    const {values} = nodeParseArgs({
      args: argv,
      options: {
        'write': {type: 'string'},
        'no-clip': {type: 'boolean', default: false},
      },
      strict: true,
    });
    return {write: values.write, clip: !values['no-clip']};
  } catch (e) {
    console.error((e as Error).message);
    console.error('Usage: echo "<markdown>" | m2m [--write <file>] [--no-clip]');
    process.exit(1);
  }
}

async function readStdin(): Promise<string> {
  const markdown = await Bun.stdin.text();
  if(!markdown) {
    console.error('Usage: echo "<markdown>" | m2m [--write <file>] [--clip]');
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

function linuxClipboardCommand(): string[] {
  const isWayland = !!process.env.WAYLAND_DISPLAY || process.env.XDG_SESSION_TYPE === 'wayland';
  if(isWayland) {
    return ['wl-copy', '--type', 'text/html'];
  }
  return ['xclip', '-selection', 'clipboard', '-t', 'text/html'];
}

function macClipboardCommand(): string[] {
  const swift = `
import Cocoa
let html = String(data: FileHandle.standardInput.readDataToEndOfFile(), encoding: .utf8)!
let pb = NSPasteboard.general
pb.clearContents()
pb.setData(html.data(using: .utf8)!, forType: .html)
`;
  return ['swift', '-e', swift];
}

function windowsClipboardCommand(): string[] {
  const ps = `
$html = [Console]::In.ReadToEnd()
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Clipboard]::SetText($html, [System.Windows.Forms.TextDataFormat]::Html)
`;
  return ['powershell', '-NoProfile', '-Command', ps];
}

function clipboardCommand(): string[] {
  const commands: Record<string, () => string[]> = {
    darwin: macClipboardCommand,
    linux: linuxClipboardCommand,
    win32: windowsClipboardCommand,
  };
  const cmd = commands[process.platform];
  if(!cmd) {
    console.error(`Unsupported platform: ${process.platform}`);
    process.exit(1);
  }
  return cmd();
}

async function sendToClipboard(html: string): Promise<void> {
  const proc = Bun.spawn(clipboardCommand(), {stdin: 'pipe', env: process.env, stderr: 'inherit'});
  const stdin = proc.stdin as FileSink;
  stdin.write(html);
  stdin.end();
  await proc.exited;
}

const args = parseArgs(process.argv.slice(2));
const markdown = await readStdin();
const html = await convertToHtml(markdown);

if(args.write) {
  await writeToFile(html, args.write);
} else if(!args.clip) {
  process.stdout.write(html);
}

if(args.clip) {
  await sendToClipboard(html);
}
