export interface FormatterRules {
  tabWidth: number;
  indentWithTabs: boolean;
  braceOnSameLine: boolean;
  elseOnNewLine: boolean;
  functionSpacing: number;
  compactHeaderNoBlankLines: boolean;
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
  preserveTrailingWhitespace: true,
  preserveWindowsEol: true
};
