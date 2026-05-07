#!/usr/bin/env bun

import type {FileSink} from 'bun';
import {marked} from 'marked';

const markdown = (await Bun.stdin.text());

if(!markdown) {
  console.error('Usage: echo "<markdown>" | m2m');
  process.exit(1);
}

const html = (await marked(markdown));

let proc: ReturnType<typeof Bun.spawn>;

if(process.platform === 'darwin') {
  const swift = `
import Cocoa
let html = String(data: FileHandle.standardInput.readDataToEndOfFile(), encoding: .utf8)!
let pb = NSPasteboard.general
pb.clearContents()
pb.setData(html.data(using: .utf8)!, forType: .html)
`;
  proc = Bun.spawn(['swift', '-e', swift], {stdin: 'pipe'});
} else if(process.platform === 'linux') {
  proc = Bun.spawn(['xclip', '-selection', 'clipboard', '-t', 'text/html'], {stdin: 'pipe'});
} else if(process.platform === 'win32') {
  const ps = `
$html = [Console]::In.ReadToEnd()
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Clipboard]::SetText($html, [System.Windows.Forms.TextDataFormat]::Html)
`;
  proc = Bun.spawn(['powershell', '-NoProfile', '-Command', ps], {stdin: 'pipe'});
} else {
  console.error(`Unsupported platform: ${process.platform}`);
  process.exit(1);
}

const stdin = (proc.stdin as FileSink);
stdin.write(html);
stdin.end();
await proc.exited;
