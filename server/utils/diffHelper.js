const Diff = require('diff');

/**
 * Compute detailed diff and line change summary between two file contents
 */
function computeDiff(previousContent = '', newContent = '', fileName = 'file') {
  const patch = Diff.createTwoFilesPatch(
    fileName,
    fileName,
    previousContent,
    newContent,
    'previous',
    'current'
  );

  const changes = Diff.diffLines(previousContent, newContent);
  let linesAdded = 0;
  let linesRemoved = 0;
  let currentLine = 1;
  let startLine = 1;
  let endLine = 1;
  let hasSetStart = false;
  const lineDetails = [];

  changes.forEach((part) => {
    const lines = part.value.split('\n');
    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    if (part.added) {
      if (!hasSetStart) {
        startLine = currentLine;
        hasSetStart = true;
      }
      linesAdded += lines.length;
      lines.forEach((line) => {
        lineDetails.push({
          lineNumber: currentLine,
          type: 'added',
          content: line,
        });
        currentLine++;
      });
      endLine = currentLine - 1;
    } else if (part.removed) {
      if (!hasSetStart) {
        startLine = currentLine;
        hasSetStart = true;
      }
      linesRemoved += lines.length;
      lines.forEach((line) => {
        lineDetails.push({
          lineNumber: currentLine,
          type: 'removed',
          content: line,
        });
      });
      endLine = currentLine;
    } else {
      currentLine += lines.length;
    }
  });

  if (!hasSetStart) {
    startLine = 1;
    endLine = currentLine;
  }

  let summary = 'No visual changes';
  if (linesAdded > 0 && linesRemoved > 0) {
    summary = `Modified lines ${startLine}–${endLine} (+${linesAdded}, -${linesRemoved})`;
  } else if (linesAdded > 0) {
    summary = `Added ${linesAdded} line${linesAdded > 1 ? 's' : ''} at line ${startLine}`;
  } else if (linesRemoved > 0) {
    summary = `Removed ${linesRemoved} line${linesRemoved > 1 ? 's' : ''} around line ${startLine}`;
  }

  return {
    diff: patch,
    summary,
    startLine,
    endLine: Math.max(startLine, endLine),
    linesAdded,
    linesRemoved,
    lineDetails,
  };
}

module.exports = { computeDiff };
