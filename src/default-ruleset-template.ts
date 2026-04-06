import * as fs from 'fs/promises';
import * as path from 'path';

export async function getDefaultRulesetTemplate(extensionPath: string): Promise<string> {
  const candidatePaths = [
    path.join(extensionPath, 'default-ruleset-template.xml'),
    path.join(extensionPath, 'out', 'default-ruleset-template.xml'),
    path.join(extensionPath, 'src', 'default-ruleset-template.xml')
  ];

  for (const configPath of candidatePaths) {
    try {
      return await fs.readFile(configPath, 'utf8');
    } catch {
      // continue
    }
  }

  throw new Error('Could not load default ruleset template from disk.');
}
