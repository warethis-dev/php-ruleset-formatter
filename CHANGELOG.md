# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.3.0] - 2026-03-05

### Changed
- Default ruleset is now loaded from `default-ruleset-template.xml` (and packaged out fallback).
- `phpRulesetFormatter.openRuleset` now upgrades legacy auto-generated workspace rulesets safely.

### Fixed
- Fixed mismatch where new version could create an outdated old template; now fully updated template used.

### Added
- Upgrade path on activate across workspace folders.
- Smoke test uses getDefaultRulesetTemplate(...) and validates new rules exist.

### Testing
- npm run smoke passes.

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