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
    try {
      const step = JSON.parse(line);
      const content = step.content || '';
      
      const svgStart = content.indexOf("<svg");
      const svgEnd = content.indexOf("</svg>", svgStart);
      
      if (svgStart !== -1 && svgEnd !== -1) {
        const svgCode = content.substring(svgStart, svgEnd + 6);
        if (!svgCode.includes("truncated")) {
          console.log(`Found complete Call SVG at line ${i}! Length: ${svgCode.length}`);
          fs.writeFileSync("./call_extracted.svg", svgCode, 'utf8');
          process.exit(0);
        } else {
          console.log(`SVG at line ${i} contains 'truncated' string.`);
        }
      } else {
        console.log(`SVG at line ${i} does not have both <svg and </svg> tags.`);
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
}

console.log("Could not find a complete Call SVG in the logs.");
