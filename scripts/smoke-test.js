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

const shortTagInput = `<? $a\n\n=\n\n1; ?>`;
const shortTagExpected = `<?php $a = 1;\n`;
const shortTagActual = formatPhp(shortTagInput, rules);

if (shortTagActual !== shortTagExpected) {
  console.error('Smoke test failed: short-tag/simple-assignment normalization mismatch.');
  process.exit(1);
}

const echoTagInput = `<?= $value ?>`;
const echoTagExpected = `<?= $value ?>\n`;
const echoTagActual = formatPhp(echoTagInput, rules);

if (echoTagActual !== echoTagExpected) {
  console.error('Smoke test failed: echo short tag should be preserved.');
  process.exit(1);
}

const modernInput = "<?php\r\nif($a==1){\r\n\tcall($x,$y);   \r\n\r\n\r\n\t$b=2;\r\n}\r\n?>";
const modernExpected = "<?php\nif ($a == 1){\n\tcall($x, $y);\n\n\t$b = 2;\n}\n";
const modernActual = formatPhp(modernInput, rules);

if (modernActual !== modernExpected) {
  console.error('Smoke test failed: modern normalization profile mismatch.');
  process.exit(1);
}

const mixedFileInput = "<div>header</div>\n<?php echo $a; ?>";
const mixedFileExpected = "<div>header</div>\n<?php echo $a; ?>\n";
const mixedFileActual = formatPhp(mixedFileInput, rules);

if (mixedFileActual !== mixedFileExpected) {
  console.error('Smoke test failed: mixed HTML/PHP file should keep closing tag.');
  process.exit(1);
}

const commentedRulesXml = `<ruleset>
  <rule ref="Custom.LineEndings.UseLf"/>
  <!-- <rule ref="Custom.WhiteSpace.OperatorSpacing"/> -->
  <!-- <exclude name="Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace"/> -->
</ruleset>`;
const commentedRules = parseRulesetXml(commentedRulesXml);

if (!commentedRules.normalizeLineEndingsToLf) {
  console.error('Smoke test failed: active rule was not parsed.');
  process.exit(1);
}

if (commentedRules.normalizeOperatorSpacing) {
  console.error('Smoke test failed: commented-out rule should be ignored.');
  process.exit(1);
}

if (commentedRules.elseOnNewLine) {
  console.error('Smoke test failed: commented-out exclude should be ignored.');
  process.exit(1);
}

console.log('Smoke test passed.');
