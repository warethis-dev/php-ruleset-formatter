````markdown
# Adding Custom Rules to PHPFormatExtension

This guide explains how to add your own custom formatting rules to the PHPFormatExtension project, and how to contribute them back to the project if you wish.

---

## 1. Adding Custom Rules (For Personal Use)

### Step 1: Understand the Rule System
- Rules are defined and processed in the `src/rules.ts`, `src/formatter.ts`, and related files.
- Each rule typically has a name, logic (function or class), and is registered in a ruleset or processing pipeline.

### Step 2: Create Your Rule Logic
- Open `src/rules.ts` (or `src/formatter.ts` if the logic is more complex).
- Define your new rule as a function, class, or object, following the pattern of existing rules.
  - Example:
    ```ts
    export function myCustomRule(lines: string[]): string[] {
      // Your formatting logic here
      return lines;
    }
    ```

### Step 3: Register the Rule
- Add your rule to the ruleset or processing pipeline in `src/formatter.ts`.
  - Example:
    ```ts
    if (rules.myCustomRuleEnabled) {
      lines = myCustomRule(lines);
    }
    ```
- Add a flag or option for your rule in the rules interface/type in `src/types.ts`.

### Step 4: Enable the Rule
- If you want to control the rule via XML, update `src/rules-xml.ts` to parse a new option or rule reference from your ruleset XML.
  - Example:
    ```ts
    if (hasRuleRef(xml, 'MyCustom.Rule.Name')) {
      parsed.myCustomRuleEnabled = true;
    }
    ```

### Step 5: Test Your Rule
- Add or update sample PHP files in the `sample/` directory to test your rule.
- Run the formatter and verify your rule works as expected.

---

## 2. Contributing Your Rule to the Project

If you want to share your new rule with others:

### Step 1: Follow Project Guidelines
- Review `CONTRIBUTING.md` for coding standards and contribution process.
- Write clear, well-documented code and tests for your rule.

### Step 2: Add Documentation
- Document your rule in the code and, if appropriate, in the README or a new documentation file.

### Step 3: Submit a Pull Request
- Fork the repository and create a new branch for your changes.
- Commit your code and push your branch to your fork.
- Open a pull request describing your rule and its purpose.
- Respond to any feedback from project maintainers.

---

## 3. Example: Enforce a Blank Line After Each Function Declaration

Suppose you want to add a custom rule that ensures there is exactly one blank line after every function’s closing brace. Here’s how you could do it:

### Step 1: Add the Rule Logic
- Open `src/rules.ts` and add the following function:

```ts
export function blankLineAfterFunction(lines: string[]): string[] {
  const output: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    output.push(lines[i]);
    // Detect end of function (simple heuristic: line with only '}' and previous line starts with 'function')
    if (
      lines[i].trim() === '}' &&
      i > 0 &&
      /^\s*function\b/.test(lines[i - 1])
    ) {
      // If next line exists and is not blank, insert a blank line
      if (lines[i + 1] && lines[i + 1].trim() !== '') {
        output.push('');
      }
    }
  }
  return output;
}
```

### Step 2: Register the Rule
- In `src/formatter.ts`, add:

```ts
import { blankLineAfterFunction } from './rules';
// ...existing code...
if (rules.blankLineAfterFunction) {
  lines = blankLineAfterFunction(lines);
}
```

### Step 3: Add a Rule Option
- In `src/types.ts`, add to your rules interface/type:

```ts
blankLineAfterFunction?: boolean;
```

### Step 4: Enable the Rule (Optional)
- In `src/rules-xml.ts`, add logic to enable the rule from XML:

```ts
if (hasRuleRef(xml, 'Custom.Functions.BlankLineAfterFunction')) {
  parsed.blankLineAfterFunction = true;
}
```

### Step 5: Test the Rule
- Add a test case to `sample/input.php` and the expected output to `sample/expected.php`.
- Run the formatter and verify that a blank line is enforced after each function.

### Step 6: Enabling the Rule in Your Ruleset XML

To enable your new rule via the ruleset XML file, add a `<rule ref="..."/>` entry that matches the reference you used in your XML parsing logic. For the example above, add this to your ruleset XML:

```xml
<rule ref="Custom.Functions.BlankLineAfterFunction"/>
```

This will activate the rule if your `src/rules-xml.ts` file includes logic like:

```ts
if (hasRuleRef(xml, 'Custom.Functions.BlankLineAfterFunction')) {
  parsed.blankLineAfterFunction = true;
}
```

Make sure to reload or re-run the formatter after updating your ruleset XML.

---

This example demonstrates how to add a brand new custom rule, register it, and (optionally) enable it via your ruleset XML file.

````
