import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { parseRulesetXml } from './rules-xml';
import { FormatterRules, defaultRules } from './types';

function parseOverrideRules(overrideRaw: unknown): Partial<FormatterRules> {
  if (!overrideRaw || typeof overrideRaw !== 'object') {
    return {};
  }

  const override = overrideRaw as Record<string, unknown>;
  const result: Partial<FormatterRules> = {};

  if (typeof override.tabWidth === 'number' && Number.isFinite(override.tabWidth) && override.tabWidth > 0) {
    result.tabWidth = Math.floor(override.tabWidth);
  }
  if (typeof override.indentWithTabs === 'boolean') {
    result.indentWithTabs = override.indentWithTabs;
  }
  if (typeof override.braceOnSameLine === 'boolean') {
    result.braceOnSameLine = override.braceOnSameLine;
  }
  if (typeof override.elseOnNewLine === 'boolean') {
    result.elseOnNewLine = override.elseOnNewLine;
  }
  if (typeof override.functionSpacing === 'number' && Number.isFinite(override.functionSpacing) && override.functionSpacing >= 0) {
    result.functionSpacing = Math.floor(override.functionSpacing);
  }
  if (typeof override.compactHeaderNoBlankLines === 'boolean') {
    result.compactHeaderNoBlankLines = override.compactHeaderNoBlankLines;
  }
  if (typeof override.normalizeUnsupportedShortOpenTags === 'boolean') {
    result.normalizeUnsupportedShortOpenTags = override.normalizeUnsupportedShortOpenTags;
  }
  if (typeof override.normalizeSimpleAssignments === 'boolean') {
    result.normalizeSimpleAssignments = override.normalizeSimpleAssignments;
  }
  if (typeof override.trimTrailingWhitespace === 'boolean') {
    result.trimTrailingWhitespace = override.trimTrailingWhitespace;
  }
  if (typeof override.normalizeLineEndingsToLf === 'boolean') {
    result.normalizeLineEndingsToLf = override.normalizeLineEndingsToLf;
  }
  if (typeof override.ensureFinalNewline === 'boolean') {
    result.ensureFinalNewline = override.ensureFinalNewline;
  }
  if (typeof override.normalizeSingleBlankLineMax === 'boolean') {
    result.normalizeSingleBlankLineMax = override.normalizeSingleBlankLineMax;
  }
  if (typeof override.normalizeKeywordSpacing === 'boolean') {
    result.normalizeKeywordSpacing = override.normalizeKeywordSpacing;
  }
  if (typeof override.normalizeOperatorSpacing === 'boolean') {
    result.normalizeOperatorSpacing = override.normalizeOperatorSpacing;
  }
  if (typeof override.normalizeCommaSpacing === 'boolean') {
    result.normalizeCommaSpacing = override.normalizeCommaSpacing;
  }
  if (typeof override.removeClosingTagInPhpOnlyFiles === 'boolean') {
    result.removeClosingTagInPhpOnlyFiles = override.removeClosingTagInPhpOnlyFiles;
  }
  if (typeof override.preserveTrailingWhitespace === 'boolean') {
    result.preserveTrailingWhitespace = override.preserveTrailingWhitespace;
  }
  if (typeof override.preserveWindowsEol === 'boolean') {
    result.preserveWindowsEol = override.preserveWindowsEol;
  }

  return result;
}

export async function loadRulesForDocument(document: vscode.TextDocument): Promise<FormatterRules> {
  const config = vscode.workspace.getConfiguration('phpRulesetFormatter', document.uri);
  const rulesetPath = config.get<string>('rulesetPath', '.vscode/php-ruleset-formatter.xml');
  const overrideRaw = config.get<unknown>('overrideRules', {});

  let rules = { ...defaultRules };

  try {
    const resolvedPath = resolveRulesetPath(document.uri, rulesetPath);
    if (resolvedPath) {
      const xml = await fs.readFile(resolvedPath, 'utf8');
      rules = parseRulesetXml(xml);
    }
  } catch {
    // Keep defaults when file cannot be loaded.
  }

  return { ...rules, ...parseOverrideRules(overrideRaw) };
}

export function resolveRulesetPath(documentUri: vscode.Uri, rulesetPath: string): string | undefined {
  if (path.isAbsolute(rulesetPath)) {
    return rulesetPath;
  }

  const folder = vscode.workspace.getWorkspaceFolder(documentUri);
  if (folder) {
    return path.join(folder.uri.fsPath, rulesetPath);
  }

  const first = vscode.workspace.workspaceFolders?.[0];
  if (!first) {
    return undefined;
  }

  return path.join(first.uri.fsPath, rulesetPath);
}
