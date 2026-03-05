import { FormatterRules, defaultRules } from './types';

function stripXmlComments(xml: string): string {
  return xml.replace(/<!--[\s\S]*?-->/g, '');
}

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
  const effectiveXml = stripXmlComments(xml);
  const parsed: FormatterRules = { ...defaultRules };

  const tabWidth = parseTabWidth(effectiveXml);
  if (typeof tabWidth === 'number' && Number.isFinite(tabWidth) && tabWidth > 0) {
    parsed.tabWidth = tabWidth;
  }

  parsed.indentWithTabs = hasRuleRef(effectiveXml, 'Generic.WhiteSpace.DisallowSpaceIndent');
  parsed.braceOnSameLine = hasRuleRef(effectiveXml, 'Generic.Functions.OpeningFunctionBraceKernighanRitchie.BraceOnNewLine');
  parsed.elseOnNewLine = hasExcludeName(effectiveXml, 'Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace');

  const spacing = parseFunctionSpacing(effectiveXml);
  if (typeof spacing === 'number' && Number.isFinite(spacing) && spacing >= 0) {
    parsed.functionSpacing = spacing;
  }

  parsed.compactHeaderNoBlankLines = hasRuleRef(effectiveXml, 'Custom.Header.NoBlankLines');
  parsed.normalizeUnsupportedShortOpenTags = hasRuleRef(effectiveXml, 'Custom.PHP.DisallowShortOpenTag');
  parsed.normalizeSimpleAssignments = hasRuleRef(effectiveXml, 'Custom.WhiteSpace.NormalizeSimpleAssignments');
  parsed.trimTrailingWhitespace = hasRuleRef(effectiveXml, 'Custom.WhiteSpace.TrimTrailingWhitespace');
  parsed.normalizeLineEndingsToLf = hasRuleRef(effectiveXml, 'Custom.LineEndings.UseLf');
  parsed.ensureFinalNewline = hasRuleRef(effectiveXml, 'Custom.Files.EnsureFinalNewline');
  parsed.normalizeSingleBlankLineMax = hasRuleRef(effectiveXml, 'Custom.WhiteSpace.SingleBlankLineMax');
  parsed.normalizeKeywordSpacing = hasRuleRef(effectiveXml, 'Custom.ControlStructures.KeywordSpacing');
  parsed.normalizeOperatorSpacing = hasRuleRef(effectiveXml, 'Custom.WhiteSpace.OperatorSpacing');
  parsed.normalizeCommaSpacing = hasRuleRef(effectiveXml, 'Custom.WhiteSpace.CommaSpacing');
  parsed.removeClosingTagInPhpOnlyFiles = hasRuleRef(effectiveXml, 'Custom.PHP.RemoveClosingTagInPhpOnlyFiles');
  parsed.preserveTrailingWhitespace = hasExcludeName(effectiveXml, 'Squiz.WhiteSpace.SuperfluousWhitespace.EndLine');
  parsed.preserveWindowsEol = hasExcludeName(effectiveXml, 'Generic.Files.LineEndings.InvalidEOLChar');

  return parsed;
}
