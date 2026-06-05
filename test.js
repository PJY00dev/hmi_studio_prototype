import fs from 'fs';
const content = fs.readFileSync('/Users/pjy/Documents/Codex/hmi_prototype/app.js', 'utf8');
try {
  new Function(content); // Try to parse it as function to catch syntax errors
  console.log("Syntax is OK via Function");
} catch(e) {
  console.error("Syntax Error:", e);
}
