const fs = require('fs');

const logPath = 'C:\\Users\\my pc\\.gemini\\antigravity\\brain\\8948608e-30ae-4ff3-9bf7-664760faa485\\.system_generated\\tasks\\task-356.log';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let currentFile = '';
  let count = 0;
  
  lines.forEach(line => {
    if (line.includes('E:\\genie gen\\src\\')) {
      currentFile = line.trim();
    } else if (line.includes('error')) {
      // Filter out style or unused var errors to focus on runtime-critical issues
      const isCritical = line.includes('no-undef') || 
                         line.includes('Error:') || 
                         line.includes('not defined') ||
                         line.includes('defined but never used') && line.includes('ReferenceError') ||
                         line.includes('Parsing error');
      
      if (isCritical && currentFile.includes('src\\')) {
        console.log(`${currentFile} -> ${line.trim()}`);
        count++;
      }
    }
  });
  console.log(`Found ${count} critical errors in src/ directory.`);
} else {
  console.log('Log file does not exist');
}
