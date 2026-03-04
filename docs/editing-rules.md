# Editing Rules

This guide explains the example: how to edit the rule in PHPFormatExtension that prevents cuddling of `else` conditions (i.e., enforces that `else` must start on a new line after a closing brace).

## Changing the Rule for Yourself (No Recompile or Contributing to the Extension)

If you want to change the cuddled `else` rule just for yourself, you can do so by editing your ruleset XML file—no need to recompile the extension.

**How to Allow Cuddled `else` Conditions:**

1. Open your ruleset XML file.
2. Make sure it does **not** include the following exclude:
  ```xml
  <exclude name="Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace"/>
  ```
3. If this line is present, remove or comment it out.
4. Save your ruleset XML file.
5. Use the formatter as usual. The extension will now allow cuddled `else` conditions for you, without any need to recompile or change the extension code.

---

## To Contribute To this Extension

### 1. Locate the Rule Logic

- The logic for splitting cuddled `else` statements is in `src/formatter.ts`, in the `splitCuddledElse` function.
- This function is called when the `elseOnNewLine` rule is enabled.
- The rule is triggered in the formatter pipeline:
  ```ts
  if (rules.elseOnNewLine) {
    lines = splitCuddledElse(lines);
  }
  ```

### 2. How the Rule Works

- The function `splitCuddledElse` looks for lines like:
  ```php
  } else {
  ```
  and splits them into:
  ```php
  }
  else {
  ```

### 3. Editing the Rule

To change how this rule works (for example, to allow cuddled `else` conditions):

1. **Open** `src/formatter.ts`.
2. **Find** the `splitCuddledElse` function.
3. **Edit or comment out** the function, or change the logic as needed.
   - To allow cuddled `else`, you can:
     - Remove or comment out the call to `splitCuddledElse` in the formatter pipeline:
       ```ts
       // lines = splitCuddledElse(lines);
       ```
     - Or, modify the function so it does nothing (returns lines unchanged).

### 4. Controlling the Rule with XML

- The rule is enabled if the XML ruleset includes `Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace`.
- This is parsed in `src/rules-xml.ts`:
  ```ts
  if (hasExcludeName(xml, 'Squiz.ControlStructures.ControlSignature.SpaceAfterCloseBrace')) {
    parsed.elseOnNewLine = true;
  }
  ```
- To change the default, adjust how `parsed.elseOnNewLine` is set.

### 5. Testing Your Change

- After editing, recompile the extension:
  ```sh
  npm run compile
  ```
- Test formatting on sample PHP files to verify the new behavior.


**Summary:**
- Edit or disable the `splitCuddledElse` function in `src/formatter.ts` to change the cuddled `else` rule for everyone.
- Or, control the rule for yourself by editing your ruleset XML file as described above.
- Recompile only if you change the extension code; for ruleset changes, just save and use the formatter.

