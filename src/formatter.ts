import { FormatterRules } from './types';

function normalizeUnsupportedShortOpenTags(input: string): string {
  // Keep <?=, <?php, and <?xml intact; normalize other short-open tags to <?php.
  return input.replace(/<\?(?!php\b|=|xml\b)/gi, '<?php');
}

function normalizeSimpleAssignments(input: string): string {
  const assignmentPattern = /(\$[A-Za-z_\x80-\xff][A-Za-z0-9_\x80-\xff]*)[ \t\r\n]*=[ \t\r\n]*([^;\r\n]+)[ \t\r\n]*;/g;

  return input.replace(assignmentPattern, (match, variable: string, rhs: string) => {
    if (!/[\r\n]/.test(match)) {
      return match;
    }

    const normalizedRhs = rhs.trim().replace(/[ \t]{2,}/g, ' ');
    return `${variable} = ${normalizedRhs};`;
  });
}

function removeClosingTagInPhpOnlyFiles(input: string): string {
  const trimmed = input.trimEnd();
  if (!trimmed.endsWith('?>')) {
    return input;
  }

  if (!/^\s*<\?php\b/i.test(trimmed)) {
    return input;
  }

  const withoutFinalClosingTag = trimmed.replace(/\?>\s*$/g, '').trimEnd();
  const afterOpeningTag = withoutFinalClosingTag.replace(/^\s*<\?php\b/i, '');

  if (/<\?(?:php|=)?/i.test(afterOpeningTag) || /\?>/.test(afterOpeningTag)) {
    return input;
  }

  return withoutFinalClosingTag;
}

function transformLineBody(line: string, transform: (body: string) => string): string {
  const indent = (line.match(/^[\t ]*/) ?? [''])[0];
  const body = line.slice(indent.length);
  return `${indent}${transform(body)}`;
}

function normalizeKeywordSpacing(lines: string[]): string[] {
  return lines.map((line) => transformLineBody(line, (body) => body.replace(/\b(if|elseif|for|foreach|while|switch|catch)\s*\(/g, '$1 (')));
}

function normalizeOperatorSpacing(lines: string[]): string[] {
  return lines.map((line) => transformLineBody(line, (body) => {
    let next = body;
    next = next.replace(/\s*(===|!==|==|!=|<=|>=|<=>|\|\||&&|=>)\s*/g, ' $1 ');
    next = next.replace(/(?<![=!<>?])\s*=\s*(?![=>])/g, ' = ');
    return next.replace(/ {2,}/g, ' ');
  }));
}

function normalizeCommaSpacing(lines: string[]): string[] {
  return lines.map((line) => transformLineBody(line, (body) => body.replace(/\s*,\s*/g, ', ')));
}

function normalizeSingleBlankLineMax(lines: string[]): string[] {
  const output: string[] = [];
  let blankCount = 0;

  for (const line of lines) {
    if (line.trim() === '') {
      blankCount += 1;
      if (blankCount > 1) {
        continue;
      }
      output.push('');
      continue;
    }

    blankCount = 0;
    output.push(line);
  }

  return output;
}

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

      // Check if line ends with a single-line comment
      const commentMatch = currentTrimmedRight.match(/(.*?)(\s*(\/\/|#).*)$/);
      if (commentMatch) {
        // Extract code before comment and the comment itself
        const codeBeforeComment = commentMatch[1];
        const comment = commentMatch[2];
        // Insert brace between code and comment
        output.push(`${codeBeforeComment} {${comment}`);
        i += 1;
        continue;
      }

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
  const eol = rules.normalizeLineEndingsToLf ? '\n' : (rules.preserveWindowsEol && input.includes('\r\n') ? '\r\n' : '\n');
  let normalized = input.replace(/\r\n?/g, '\n');

  if (rules.normalizeUnsupportedShortOpenTags) {
    normalized = normalizeUnsupportedShortOpenTags(normalized);
  }

  if (rules.normalizeSimpleAssignments) {
    normalized = normalizeSimpleAssignments(normalized);
  }

  if (rules.removeClosingTagInPhpOnlyFiles) {
    normalized = removeClosingTagInPhpOnlyFiles(normalized);
  }

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

  if (rules.normalizeKeywordSpacing) {
    lines = normalizeKeywordSpacing(lines);
  }

  if (rules.normalizeOperatorSpacing) {
    lines = normalizeOperatorSpacing(lines);
  }

  if (rules.normalizeCommaSpacing) {
    lines = normalizeCommaSpacing(lines);
  }

  if (rules.normalizeSingleBlankLineMax) {
    lines = normalizeSingleBlankLineMax(lines);
  }

  lines = normalizeFunctionSpacing(lines, rules.functionSpacing);

  if (rules.trimTrailingWhitespace || !rules.preserveTrailingWhitespace) {
    lines = lines.map((line) => line.replace(/[ \t]+$/g, ''));
  }

  let output = lines.join(eol);
  if (rules.ensureFinalNewline) {
    output = output.replace(/(?:\r\n|\n)+$/g, '') + eol;
  }

  return output;
}
