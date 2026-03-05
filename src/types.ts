export interface FormatterRules {
  tabWidth: number;
  indentWithTabs: boolean;
  braceOnSameLine: boolean;
  elseOnNewLine: boolean;
  functionSpacing: number;
  compactHeaderNoBlankLines: boolean;
  normalizeUnsupportedShortOpenTags: boolean;
  normalizeSimpleAssignments: boolean;
  trimTrailingWhitespace: boolean;
  normalizeLineEndingsToLf: boolean;
  ensureFinalNewline: boolean;
  normalizeSingleBlankLineMax: boolean;
  normalizeKeywordSpacing: boolean;
  normalizeOperatorSpacing: boolean;
  normalizeCommaSpacing: boolean;
  removeClosingTagInPhpOnlyFiles: boolean;
  preserveTrailingWhitespace: boolean;
  preserveWindowsEol: boolean;
}

export const defaultRules: FormatterRules = {
  tabWidth: 4,
  indentWithTabs: true,
  braceOnSameLine: true,
  elseOnNewLine: true,
  functionSpacing: 1,
  compactHeaderNoBlankLines: false,
  normalizeUnsupportedShortOpenTags: false,
  normalizeSimpleAssignments: false,
  trimTrailingWhitespace: false,
  normalizeLineEndingsToLf: false,
  ensureFinalNewline: false,
  normalizeSingleBlankLineMax: false,
  normalizeKeywordSpacing: false,
  normalizeOperatorSpacing: false,
  normalizeCommaSpacing: false,
  removeClosingTagInPhpOnlyFiles: false,
  preserveTrailingWhitespace: true,
  preserveWindowsEol: true
};
