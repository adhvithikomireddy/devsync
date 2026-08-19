const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

const MAX_EXECUTION_TIME_MS = 10000;
const MAX_OUTPUT_BYTES = 50000;

/**
 * Execute code in isolated temp environment with resource bounds & timeout
 */
async function executeCode({ language, code, fileName = 'main', stdin = '' }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devsync-exec-'));
  const startTime = performance.now();

  try {
    let command = '';
    let args = [];
    let sourceFilePath = '';

    // Determine language and setup runner files
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'nodejs':
        sourceFilePath = path.join(tempDir, 'script.js');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        command = 'node';
        args = [sourceFilePath];
        break;

      case 'python':
      case 'py':
        sourceFilePath = path.join(tempDir, 'script.py');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        command = process.platform === 'win32' ? 'python' : 'python3';
        args = [sourceFilePath];
        break;

      case 'c':
        sourceFilePath = path.join(tempDir, 'main.c');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        const cOut = path.join(tempDir, process.platform === 'win32' ? 'main.exe' : 'main');
        
        // Compile first
        const compileC = await runSubprocess('gcc', [sourceFilePath, '-o', cOut], tempDir, 5000);
        if (compileC.exitCode !== 0) {
          return {
            stdout: '',
            stderr: `[C Compilation Error]:\n${compileC.stderr || compileC.stdout}`,
            exitCode: compileC.exitCode || 1,
            executionTime: ((performance.now() - startTime) / 1000).toFixed(3),
          };
        }
        command = cOut;
        args = [];
        break;

      case 'cpp':
      case 'c++':
        sourceFilePath = path.join(tempDir, 'main.cpp');
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        const cppOut = path.join(tempDir, process.platform === 'win32' ? 'main.exe' : 'main');
        
        // Compile first
        const compileCpp = await runSubprocess('g++', [sourceFilePath, '-o', cppOut], tempDir, 15000);
        if (compileCpp.exitCode !== 0) {
          return {
            stdout: '',
            stderr: `[C++ Compilation Error]:\n${compileCpp.stderr || compileCpp.stdout}`,
            exitCode: compileCpp.exitCode || 1,
            executionTime: ((performance.now() - startTime) / 1000).toFixed(3),
          };
        }
        command = cppOut;
        args = [];
        break;

      case 'java':
        // Match public class name or default to Main
        const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        const className = classMatch ? classMatch[1] : 'Main';
        sourceFilePath = path.join(tempDir, `${className}.java`);
        fs.writeFileSync(sourceFilePath, code, 'utf8');
        
        // Compile first
        const compileJava = await runSubprocess('javac', [sourceFilePath], tempDir, 15000);
        if (compileJava.exitCode !== 0) {
          return {
            stdout: '',
            stderr: `[Java Compilation Error]:\n${compileJava.stderr || compileJava.stdout}`,
            exitCode: compileJava.exitCode || 1,
            executionTime: ((performance.now() - startTime) / 1000).toFixed(3),
          };
        }
        command = 'java';
        args = ['-cp', tempDir, className];
        break;

      default:
        return {
          stdout: '',
          stderr: `Unsupported language for sandbox execution: ${language}`,
          exitCode: 1,
          executionTime: '0.000',
        };
    }

    const result = await runSubprocess(command, args, tempDir, MAX_EXECUTION_TIME_MS, stdin);
    const executionTime = ((performance.now() - startTime) / 1000).toFixed(3);

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      executionTime,
    };
  } finally {
    // Cleanup temp directory asynchronously
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanErr) {
      // ignore cleanup errors
    }
  }
}

function runSubprocess(command, args, cwd, timeoutMs, stdin = '') {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    // Use shell on Windows for compiled executables & scripts
    const proc = spawn(command, args, {
      cwd,
      shell: process.platform === 'win32',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_ENV: 'sandbox',
        PYTHONUNBUFFERED: '1',
      },
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (stdin) {
      try {
        proc.stdin.write(stdin);
        proc.stdin.end();
      } catch (e) {}
    } else {
      try {
        proc.stdin.end();
      } catch (e) {}
    }

    proc.stdout.on('data', (data) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += data.toString('utf8');
      } else if (!stdout.endsWith('\n[Output Truncated]')) {
        stdout += '\n[Output Truncated: Exceeded Maximum Output Buffer]';
      }
    });

    proc.stderr.on('data', (data) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += data.toString('utf8');
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + `\nProcess error: ${err.message}`,
        exitCode: 1,
      });
    });

    proc.on('close', (exitCode) => {
      clearTimeout(timer);
      if (isTimedOut) {
        resolve({
          stdout,
          stderr: stderr + `\n[Execution Terminated: Timeout exceeded ${timeoutMs / 1000}s limit]`,
          exitCode: 124,
        });
      } else {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode ?? 0,
        });
      }
    });
  });
}

module.exports = { executeCode };
