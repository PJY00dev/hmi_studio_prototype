import fs from 'fs';

const logPath = "/Users/pjy/.gemini/antigravity/brain/305cbde6-e0d4-468c-9313-3aa9f63d2423/.system_generated/logs/transcript.jsonl";
const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

const step = JSON.parse(lines[4173]);
console.log("Content length:", step.content.length);
console.log("Content:");
console.log(step.content);
