# PHP Ruleset Formatter

A small VS Code extension that formats PHP using a lightweight interpreter for an XML ruleset.

## Features

- Formats full document and selected ranges for PHP files.
- Adds **Format PHP (Ruleset)** in the editor context menu.
- Adds **PHP Ruleset Formatter: Open Ruleset File** command to quickly edit rules.
- Reads rules from `.vscode/php-ruleset-formatter.xml` by default.
- Supports settings overrides.

## Settings

- `phpRulesetFormatter.rulesetPath`: XML ruleset path.
- `phpRulesetFormatter.overrideRules`: object for overriding parsed rules.

## Edit rules quickly

Run **PHP Ruleset Formatter: Open Ruleset File** from the Command Palette.

- If the configured ruleset file exists, it opens directly. (`.vscode/php-ruleset-formatter.xml`)
- If it does not exist, the extension creates it with the base template and opens it.

## Supported rules (current)

- `tab-width` argument.
- `Generic.WhiteSpace.DisallowSpaceIndent` -> tab indentation.
- `Generic.Functions.OpeningFunctionBraceKernighanRitchie.BraceOnNewLine` -> opening brace on same line.
- `Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace` excluded -> no else cuddling.
- `Squiz.WhiteSpace.FunctionSpacing` property `spacing`.
- `Custom.Header.NoBlankLines` -> removes blank lines between `<?php`, `namespace`, `use`, and `declare(...)` header lines.
- Exclusions for trailing whitespace and Windows EOL behavior.

This extension does not run PHPCS. It applies simple formatting transformations based on interpreted rules.

## Documentation
- [Github Pages](https://warethis-dev.github.io/php-ruleset-formatter/)
---
- [Docs home](docs/index.md)
- [Editing Rules](docs/editing-rules.md)
- [Custom Rules](docs/custom-rules.md)
## Package and install

1. Build a VSIX:

	`npm run package:vsix`

2. In VS Code, run **Extensions: Install from VSIX...** and choose the generated `.vsix` file.
