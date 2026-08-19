/**
 * Generate starter files for new projects based on template
 */
function getTemplateFiles(template = 'javascript', projectName = 'My Project') {
  const files = [];

  // Always add README.md
  files.push({
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# ${projectName}

Welcome to **${projectName}**, built collaboratively on [DevSync](https://devsync.dev).

## Project Overview
This is a collaborative engineering workspace project configured with the **${template}** environment.

## Getting Started
1. Open any file in the File Explorer on the left.
2. Edit code collaboratively with your team in real time.
3. Click the **Run** or **Preview** button to execute or preview code.
4. Use **AI Assistant** for instant debugging, code explanation, and optimizations.
5. Click **Start Meeting** to communicate via crystal-clear audio, video, and screen sharing.

---
*Build Together. Code Together. Ship Together.*
`,
  });

  switch (template) {
    case 'html':
    case 'html-css':
      files.push({
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName} — DevSync Web Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="badge">DevSync Real-time Web Workspace</div>
      <h1>${projectName}</h1>
      <p class="subtitle">Built collaboratively with HTML5, CSS3, and JavaScript.</p>
    </header>

    <main class="card-grid">
      <div class="card">
        <h3>🚀 Real-time Sync</h3>
        <p>Edit this HTML, CSS, or JS file and watch your teammates see updates instantly.</p>
        <button id="actionBtn" class="btn primary">Click Interactive Action</button>
      </div>

      <div class="card">
        <h3>📊 Live Stats</h3>
        <div class="stat-box">
          <span class="stat-number" id="clickCounter">0</span>
          <span class="stat-label">Interactions</span>
        </div>
      </div>
    </main>

    <footer>
      <p>DevSync • Build Together. Code Together. Ship Together.</p>
    </footer>
  </div>

  <script src="script.js"></script>
</body>
</html>
`,
      });

      files.push({
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `/* Modern Clean CSS Stylesheet */
:root {
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background-color: var(--bg-color);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.container {
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.badge {
  display: inline-block;
  background: rgba(99, 102, 241, 0.15);
  color: var(--accent);
  border: 1px solid rgba(99, 102, 241, 0.3);
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #ffffff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
}

.card p {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.25rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: var(--accent-hover);
  transform: scale(1.02);
}

.btn:active {
  transform: scale(0.98);
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent);
  font-family: monospace;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

footer {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.75rem;
}
`,
      });

      files.push({
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `// Interactive JavaScript logic
document.addEventListener('DOMContentLoaded', () => {
  const actionBtn = document.getElementById('actionBtn');
  const counterDisplay = document.getElementById('clickCounter');

  let count = 0;

  actionBtn.addEventListener('click', () => {
    count += 1;
    counterDisplay.textContent = count;
    
    // Add visual bounce animation
    counterDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
      counterDisplay.style.transform = 'scale(1)';
    }, 150);

    console.log(\`[DevSync Web App] User clicked action button. New count: \${count}\`);
  });

  console.log('🚀 DevSync HTML/CSS/JS workspace initialized successfully.');
});
`,
      });
      break;

    case 'javascript':
    default:
      files.push({
        name: 'index.js',
        path: 'index.js',
        language: 'javascript',
        content: `// Welcome to DevSync Collaborative Editor
function calculateMetrics(items) {
  console.log("Analyzing project data...");
  const total = items.reduce((acc, item) => acc + item.value, 0);
  const average = total / (items.length || 1);
  return { total, average, count: items.length };
}

const sampleData = [
  { name: "Task Alpha", value: 42 },
  { name: "Task Beta", value: 88 },
  { name: "Task Gamma", value: 120 }
];

const result = calculateMetrics(sampleData);
console.log("DevSync Execution Result:", JSON.stringify(result, null, 2));
`,
      });
      files.push({
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
`,
      });
      break;

    case 'react':
      files.push({
        name: 'App.jsx',
        path: 'src/App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [collaborators, setCollaborators] = useState(['Adhvithi', 'Rahul', 'Ananya']);
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>DevSync React Workspace</h1>
      <p>Real-time collaboration active.</p>
      <button onClick={() => setCount(c => c + 1)}>
        Live Counter: {count}
      </button>
      <ul>
        {collaborators.map((name, i) => (
          <li key={i}>🟢 {name} (Online)</li>
        ))}
      </ul>
    </div>
  );
}
`,
      });
      files.push({
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${projectName} - DevSync</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
      });
      break;

    case 'nodejs':
      files.push({
        name: 'server.js',
        path: 'server.js',
        language: 'javascript',
        content: `const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'online',
    platform: 'DevSync Collaborative Node.js Server',
    timestamp: new Date().toISOString()
  }));
});

console.log("DevSync Node.js Microservice initialized successfully.");
`,
      });
      break;

    case 'python':
      files.push({
        name: 'main.py',
        path: 'main.py',
        language: 'python',
        content: `# DevSync Python Workspace
import math

def calculate_fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence[:n]

if __name__ == "__main__":
    print("🚀 Running Python application on DevSync...")
    n = 10
    fib = calculate_fibonacci(n)
    print(f"First {n} Fibonacci numbers: {fib}")
    print(f"Square root of 144: {math.sqrt(144)}")
`,
      });
      break;

    case 'java':
      files.push({
        name: 'Main.java',
        path: 'Main.java',
        language: 'java',
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=================================");
        System.out.println(" DevSync Java Workspace Active! ");
        System.out.println("=================================");
        
        int a = 15;
        int b = 25;
        System.out.println("Sum of " + a + " + " + b + " = " + (a + b));
    }
}
`,
      });
      break;

    case 'c':
      files.push({
        name: 'main.c',
        path: 'main.c',
        language: 'c',
        content: `#include <stdio.h>

int main() {
    printf("DevSync C Workspace\\n");
    printf("Compiling and running safely in isolated sandbox.\\n");
    
    int sum = 0;
    for (int i = 1; i <= 10; i++) {
        sum += i;
    }
    printf("Sum from 1 to 10 is: %d\\n", sum);
    return 0;
}
`,
      });
      break;

    case 'cpp':
      files.push({
        name: 'main.cpp',
        path: 'main.cpp',
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "DevSync C++ Workspace" << std::endl;
    std::vector<int> numbers = {10, 20, 30, 40, 50};
    int total = std::accumulate(numbers.begin(), numbers.end(), 0);
    
    std::cout << "Vector elements count: " << numbers.size() << std::endl;
    std::cout << "Accumulated sum: " << total << std::endl;
    return 0;
}
`,
      });
      break;
  }

  return files;
}

module.exports = { getTemplateFiles };
