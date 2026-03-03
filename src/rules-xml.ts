import { FormatterRules, defaultRules } from './types';

function hasRuleRef(xml: string, ref: string): boolean {
  const pattern = new RegExp(`<rule\\s+ref=["']${escapeRegExp(ref)}["'][^>]*>`, 'i');
  return pattern.test(xml);
}

function hasExcludeName(xml: string, name: string): boolean {
  const pattern = new RegExp(`<exclude\\s+name=["']${escapeRegExp(name)}["'][^>]*\\/?\\s*>`, 'i');
  return pattern.test(xml);
}

function parseFunctionSpacing(xml: string): number | undefined {
  const ruleMatch = xml.match(/<rule\s+ref=["']Squiz\.WhiteSpace\.FunctionSpacing["'][^>]*>([\s\S]*?)<\/rule>/i);
  if (!ruleMatch) {
    return undefined;
  }

  const propertyMatch = ruleMatch[1].match(/<property\s+name=["']spacing["']\s+value=["'](\d+)["'][^>]*\/?\s*>/i);
  if (!propertyMatch) {
    return undefined;
  }

  return Number.parseInt(propertyMatch[1], 10);
}

function parseTabWidth(xml: string): number | undefined {
  const argMatch = xml.match(/<arg\s+name=["']tab-width["']\s+value=["'](\d+)["'][^>]*\/?\s*>/i);
  if (!argMatch) {
    return undefined;
  }

  return Number.parseInt(argMatch[1], 10);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseRulesetXml(xml: string): FormatterRules {
  const parsed: FormatterRules = { ...defaultRules };

  const tabWidth = parseTabWidth(xml);
  if (typeof tabWidth === 'number' && Number.isFinite(tabWidth) && tabWidth > 0) {
    parsed.tabWidth = tabWidth;
  }

  if (hasRuleRef(xml, 'Generic.WhiteSpace.DisallowSpaceIndent')) {
    parsed.indentWithTabs = true;
  }

  if (hasRuleRef(xml, 'Generic.Functions.OpeningFunctionBraceKernighanRitchie.BraceOnNewLine')) {
    parsed.braceOnSameLine = true;
  }

  if (hasExcludeName(xml, 'Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace')) {
    parsed.elseOnNewLine = true;
  }

  const spacing = parseFunctionSpacing(xml);
  if (typeof spacing === 'number' && Number.isFinite(spacing) && spacing >= 0) {
    parsed.functionSpacing = spacing;
  }

  if (hasRuleRef(xml, 'Custom.Header.NoBlankLines')) {
    parsed.compactHeaderNoBlankLines = true;
  }

  if (hasExcludeName(xml, 'Squiz.WhiteSpace.SuperfluousWhitespace.EndLine')) {
    parsed.preserveTrailingWhitespace = true;
  }

  if (hasExcludeName(xml, 'Generic.Files.LineEndings.InvalidEOLChar')) {
    parsed.preserveWindowsEol = true;
  }

  return parsed;
}
