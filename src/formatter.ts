import { FormatterRules } from './types';

function countLeadingSpaces(line: string): number {
  let count = 0;
  for (const char of line) {
    if (char === ' ') {
      count += 1;
      continue;
    }
    break;
  }
  return count;
}

function convertLeadingSpaceIndentToTabs(line: string, tabWidth: number): string {
  const spaceCount = countLeadingSpaces(line);
  if (spaceCount === 0) {
    return line;
  }

  const tabs = Math.floor(spaceCount / tabWidth);
  const spaces = spaceCount % tabWidth;
  return '\t'.repeat(tabs) + ' '.repeat(spaces) + line.slice(spaceCount);
}

function normalizeBraceToSameLine(lines: string[]): string[] {
  const output: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const current = lines[i];
    const next = lines[i + 1];

    if (typeof next === 'string' && next.trim() === '{' && current.trim() !== '') {
      const currentTrimmedRight = current.replace(/[ \t]+$/g, '');
      output.push(`${currentTrimmedRight} {`);
      i += 1;
      continue;
    }

    output.push(current);
  }

  return output;
}

function splitCuddledElse(lines: string[]): string[] {
  const output: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([\t ]*)}\s*else\b([\s\S]*)$/);
    if (!match) {
      output.push(line);
      continue;
    }

    const indent = match[1] ?? '';
    const rest = (match[2] ?? '').trim();
    output.push(`${indent}}`);
    output.push(rest.length > 0 ? `${indent}else ${rest}` : `${indent}else`);
  }

  return output;
}

function normalizeFunctionSpacing(lines: string[], spacing: number): string[] {
  const output: string[] = [];

  const isFunctionDeclaration = (line: string): boolean => {
    const trimmed = line.trim();
    return /^(public|protected|private|static|final|abstract|readonly|\s)*function\b/i.test(trimmed) || /^function\b/i.test(trimmed);
  };

  for (const line of lines) {
    if (!isFunctionDeclaration(line)) {
      output.push(line);
      continue;
    }

    while (output.length > 0 && output[output.length - 1].trim() === '') {
      output.pop();
    }

    if (output.length > 0) {
      for (let i = 0; i < spacing; i += 1) {
        output.push('');
      }
    }

    output.push(line);
  }

  const withPostSpacing: string[] = [];
  for (let i = 0; i < output.length; i += 1) {
    const line = output[i];
    withPostSpacing.push(line);

    if (line.trim() !== '}') {
      continue;
    }

    const next = output[i + 1];
    if (typeof next !== 'string' || next.trim() === '' || next.trim() === '}') {
      continue;
    }

    if (/^(else\b|elseif\b|catch\b|finally\b)/i.test(next.trim())) {
      continue;
    }

    for (let j = 0; j < spacing; j += 1) {
      withPostSpacing.push('');
    }
  }

  return withPostSpacing;
}

function normalizeHeaderSpacing(lines: string[]): string[] {
  const output: string[] = [];
  let inHeaderRegion = false;
  let seenNonHeaderContent = false;

  const isHeaderLine = (line: string): boolean => {
    const trimmed = line.trim();
    return /^namespace\b/i.test(trimmed) || /^use\b/i.test(trimmed) || /^declare\s*\(/i.test(trimmed);
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!inHeaderRegion && trimmed.startsWith('<?php')) {
      inHeaderRegion = true;
      output.push(line);
      continue;
    }

    if (!inHeaderRegion && !seenNonHeaderContent && isHeaderLine(trimmed)) {
      inHeaderRegion = true;
      output.push(line);
      continue;
    }

    if (inHeaderRegion) {
      if (trimmed === '') {
        let cursor = index + 1;
        while (cursor < lines.length && lines[cursor].trim() === '') {
          cursor += 1;
        }

        const nextTrimmed = lines[cursor]?.trim() ?? '';
        if (isHeaderLine(nextTrimmed)) {
          continue;
        }

        output.push(line);
        continue;
      }

      if (isHeaderLine(trimmed)) {
        output.push(line);
        continue;
      }

      inHeaderRegion = false;
      output.push(line);
      if (trimmed !== '') {
        seenNonHeaderContent = true;
      }
      continue;
    }

    if (trimmed !== '' && !isHeaderLine(trimmed) && !trimmed.startsWith('<?php')) {
      seenNonHeaderContent = true;
    }

    output.push(line);
  }

  return output;
}

export function formatPhp(input: string, rules: FormatterRules): string {
  const eol = rules.preserveWindowsEol && input.includes('\r\n') ? '\r\n' : '\n';
  const normalized = input.replace(/\r\n?/g, '\n');

  let lines = normalized.split('\n');

  if (rules.indentWithTabs) {
    lines = lines.map((line) => convertLeadingSpaceIndentToTabs(line, rules.tabWidth));
  }

  if (rules.braceOnSameLine) {
    lines = normalizeBraceToSameLine(lines);
  }

  if (rules.elseOnNewLine) {
    lines = splitCuddledElse(lines);
  }

  if (rules.compactHeaderNoBlankLines) {
    lines = normalizeHeaderSpacing(lines);
  }

  lines = normalizeFunctionSpacing(lines, rules.functionSpacing);

  if (!rules.preserveTrailingWhitespace) {
    lines = lines.map((line) => line.replace(/[ \t]+$/g, ''));
  }

  return lines.join(eol);
}
