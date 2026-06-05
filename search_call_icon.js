import fs from 'fs';

const logPath = "/Users/pjy/.gemini/antigravity/brain/305cbde6-e0d4-468c-9313-3aa9f63d2423/.system_generated/logs/transcript.jsonl";

if (!fs.existsSync(logPath)) {
  console.error("Log file does not exist.");
  process.exit(1);
}

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("Call icon") && line.includes("<svg")) {
    console.log(`Line ${i} contains 'Call icon'. Length: ${line.length}`);
    try {
      const step = JSON.parse(line);
      if (step.source === 'USER_EXPLICIT') {
        console.log(`Found USER_INPUT. Content length: ${step.content.length}`);
        // Print around defs
        const defsIndex = step.content.indexOf("<defs>");
        if (defsIndex !== -1) {
          console.log("Defs content section:");
          console.log(step.content.substring(defsIndex, defsIndex + 1500));
        }
      }
    } catch (e) {
      console.log(`Failed to parse line ${i}: ${e.message}`);
    }
  }
}
