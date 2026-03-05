# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.2.0] - 2026-03-05

### Changed
- Default formatting behavior updated significantly.
- Removed unsupported PHPCS scope and PSR reference noise from default ruleset/template.
- XML parsing now ignores commented rules/excludes, so commenting entries in the ruleset reliably disables them.

### Added
- New normalization rules:
	- `Custom.PHP.DisallowShortOpenTag`
	- `Custom.WhiteSpace.NormalizeSimpleAssignments`
	- `Custom.WhiteSpace.TrimTrailingWhitespace`
	- `Custom.LineEndings.UseLf`
	- `Custom.Files.EnsureFinalNewline`
	- `Custom.WhiteSpace.SingleBlankLineMax`
	- `Custom.ControlStructures.KeywordSpacing`
	- `Custom.WhiteSpace.OperatorSpacing`
	- `Custom.WhiteSpace.CommaSpacing`
	- `Custom.PHP.RemoveClosingTagInPhpOnlyFiles`
- Mixed-file safety coverage to ensure `?>` is not removed when HTML and PHP are combined.
- Echo tag preservation coverage for `<?= ... ?>`.

## [0.1.0] - 2026-03-03

### Added
- First public release.
- XML ruleset formatting support.
- Context menu command: Format PHP (Ruleset).
- Command: Open Ruleset File.
- Custom rule: Custom.Header.NoBlankLines.
- VSIX packaging support.