import * as vscode from 'vscode';
import { formatPhp } from './formatter';
import * as fs from 'fs/promises';
import * as path from 'path';
import { defaultRulesetTemplate } from './default-ruleset-template';
import { loadRulesForDocument, resolveRulesetPath } from './rules';

async function buildDocumentEdit(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
  const rules = await loadRulesForDocument(document);
  const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length));
  const formatted = formatPhp(document.getText(), rules);
  return [vscode.TextEdit.replace(fullRange, formatted)];
}

async function buildRangeEdit(document: vscode.TextDocument, range: vscode.Range): Promise<vscode.TextEdit[]> {
  const rules = await loadRulesForDocument(document);
  const source = document.getText(range);
  const formatted = formatPhp(source, rules);
  return [vscode.TextEdit.replace(range, formatted)];
}

export function activate(context: vscode.ExtensionContext): void {
  const documentProvider = vscode.languages.registerDocumentFormattingEditProvider('php', {
    provideDocumentFormattingEdits(document: vscode.TextDocument) {
      return buildDocumentEdit(document);
    }
  });

  const rangeProvider = vscode.languages.registerDocumentRangeFormattingEditProvider('php', {
    provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range) {
      return buildRangeEdit(document, range);
    }
  });

  const command = vscode.commands.registerTextEditorCommand('phpRulesetFormatter.format', async (editor: vscode.TextEditor) => {
    const document = editor.document;
    if (document.languageId !== 'php') {
      return;
    }

    const selection = editor.selection;
    const hasSelection = !selection.isEmpty;

    const edits = hasSelection
      ? await buildRangeEdit(document, selection)
      : await buildDocumentEdit(document);

    await editor.edit((editBuilder: vscode.TextEditorEdit) => {
      for (const edit of edits) {
        editBuilder.replace(edit.range, edit.newText);
      }
    });
  });

  const openRuleset = vscode.commands.registerCommand('phpRulesetFormatter.openRuleset', async () => {
    const activeDocument = vscode.window.activeTextEditor?.document;
    const anchorUri = activeDocument?.uri ?? vscode.workspace.workspaceFolders?.[0]?.uri;
    if (!anchorUri) {
      void vscode.window.showErrorMessage('Open a workspace folder first to edit the ruleset file.');
      return;
    }

    const config = vscode.workspace.getConfiguration('phpRulesetFormatter', anchorUri);
    const configuredPath = config.get<string>('rulesetPath', '.vscode/php-ruleset-formatter.xml');
    const resolvedPath = resolveRulesetPath(anchorUri, configuredPath);

    if (!resolvedPath) {
      void vscode.window.showErrorMessage('Could not resolve ruleset path.');
      return;
    }

    try {
      await fs.access(resolvedPath);
    } catch {
      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
      await fs.writeFile(resolvedPath, defaultRulesetTemplate, 'utf8');
    }

    const document = await vscode.workspace.openTextDocument(vscode.Uri.file(resolvedPath));
    await vscode.window.showTextDocument(document);
  });

  context.subscriptions.push(documentProvider, rangeProvider, command, openRuleset);
}

export function deactivate(): void {
  // no-op
}
