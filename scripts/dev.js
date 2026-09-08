#!/usr/bin/env node
// Cross-platform concurrent dev runner. Spawns backend (port 5000) and
// frontend (port 5173) at the same time. Ctrl-C stops both.
const { spawn } = require('child_process');
const path = require('path');

const procs = [];

function run(name, cwd, cmd, args) {
  const p = spawn(cmd, args, {
    cwd: path.join(__dirname, '..', cwd),
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  p.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    procs.forEach((q) => q !== p && q.kill('SIGTERM'));
    process.exit(code || 0);
  });
  procs.push(p);
}

if (process.platform === 'win32') {
  run('backend', 'backend', 'npm.cmd', ['run', 'dev']);
  run('frontend', 'frontend', 'npm.cmd', ['run', 'dev']);
} else {
  run('backend', 'backend', 'npm', ['run', 'dev']);
  run('frontend', 'frontend', 'npm', ['run', 'dev']);
}

process.on('SIGINT', () => {
  procs.forEach((p) => p.kill('SIGINT'));
  process.exit(0);
});
process.on('SIGTERM', () => {
  procs.forEach((p) => p.kill('SIGTERM'));
  process.exit(0);
});
