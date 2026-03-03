const fs = require('fs');
const path = require('path');
const { formatPhp } = require('../out/formatter');
const { parseRulesetXml } = require('../out/rules-xml');
const { defaultRulesetTemplate } = require('../out/default-ruleset-template');

const workspace = path.resolve(__dirname, '..');
const inputPath = path.join(workspace, 'sample', 'input.php');
const expectedPath = path.join(workspace, 'sample', 'expected.php');

const rulesXml = defaultRulesetTemplate;
const input = fs.readFileSync(inputPath, 'utf8');
const expected = fs.readFileSync(expectedPath, 'utf8');

const rules = parseRulesetXml(rulesXml);
const actual = formatPhp(input, rules);

if (actual !== expected) {
  console.error('Smoke test failed: formatted output does not match expected output.');
  process.exit(1);
}

console.log('Smoke test passed.');
