# PHP Ruleset Formatter

A small VS Code extension that formats PHP using a lightweight interpreter for a PHPCS-style XML ruleset.

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

- If the configured ruleset file exists, it opens directly.
- If it does not exist, the extension creates it with the base template and opens it.

## Supported rules (current)


This extension does not run PHPCS. It applies simple formatting transformations based on interpreted rules.

## Documentation

User-facing documentation is available in the `docs/` folder. These files are intended to be published via GitHub Pages (set Pages source to the `main` branch and `/docs` folder) if you want a browsable site.

- [Docs home](docs/index.md)
- [Editing Rules](docs/editing-rules.md)
- [Custom Rules](docs/custom-rules.md)
## Package and install

1. Build a VSIX:

	`npm run package:vsix`

2. In VS Code, run **Extensions: Install from VSIX...** and choose the generated `.vsix` file.
