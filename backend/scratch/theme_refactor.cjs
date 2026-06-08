const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../src/screens'),
  path.join(__dirname, '../src/components')
];

// Helper to replace contents
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's do replacements:
  
  // 1. Text Colors
  content = content.replace(/color:\s*['"]#0[dD]0[dD]0[dD]['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#111111['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#111['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#000000['"]/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*['"]#000['"]/g, "color: 'var(--text-primary)'");

  content = content.replace(/color:\s*['"]#9[bB]9[bB]9[bB]['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#999999['"]/g, "color: 'var(--text-muted)'");
  content = content.replace(/color:\s*['"]#999['"]/g, "color: 'var(--text-muted)'");

  content = content.replace(/color:\s*['"]#5[cC]5[cC]5[cC]['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#555555['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#555['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#666666['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#666['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#777777['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#777['"]/g, "color: 'var(--text-secondary)'");
  content = content.replace(/color:\s*['"]#8[eE]9094['"]/g, "color: 'var(--text-secondary)'");

  // 2. Backgrounds
  // Main Wrapper backgrounds (height: '100%', background: '#FFFFFF' or flex: 1, background: '#FFFFFF' or similar)
  content = content.replace(/(style=\{\{\s*(?:flex:\s*1|height:\s*['"]100%['"]|height:\s*['"]100dvh['"]|width:\s*['"]100%['"])[^}]*background:\s*['"])(?:#FFFFFF|#ffffff|#FAFAFA|#fafafa|#FAFAF8|#fafaf8)(['"])/g, "$1var(--bg)$2");
  // Also target: full-height-scroll backgrounds
  content = content.replace(/(className=["']full-height-scroll[^"']*["']\s*style=\{\{[^}]*background:\s*['"])(?:#FFFFFF|#ffffff|#FAFAFA|#fafafa|#FAFAF8|#fafaf8)(['"])/g, "$1var(--bg)$2");
  
  // Generic backgrounds
  content = content.replace(/background:\s*['"]#FFFFFF['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]#ffffff['"]/g, "background: 'var(--bg-card)'");
  content = content.replace(/background:\s*['"]#FAFAFA['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#fafafa['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#FAFAF8['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#fafaf8['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#F5F5F5['"]/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*['"]#f5f5f5['"]/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*['"]#F7F7F7['"]/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*['"]#f7f7f7['"]/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*['"]#F7F7F5['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#f7f7f5['"]/g, "background: 'var(--bg-subtle)'");
  content = content.replace(/background:\s*['"]#F2F2F0['"]/g, "background: 'var(--bg-surface)'");
  content = content.replace(/background:\s*['"]#f2f2f0['"]/g, "background: 'var(--bg-surface)'");

  // Inverted background / text for active black actions
  content = content.replace(/background:\s*['"]#0[dD]0[dD]0[dD]['"]/g, "background: 'var(--text-primary)'");
  content = content.replace(/background:\s*['"]#111111['"]/g, "background: 'var(--text-primary)'");
  content = content.replace(/background:\s*['"]#111['"]/g, "background: 'var(--text-primary)'");
  
  // 3. Borders
  content = content.replace(/#EFEFEF/gi, "var(--border)");
  content = content.replace(/#E8E8E8/gi, "var(--border)");
  content = content.replace(/#EBEBEB/gi, "var(--border)");
  content = content.replace(/#F0F0EE/gi, "var(--border-light)");
  content = content.replace(/#F5F5F5/gi, "var(--border-light)");
  content = content.replace(/#F0F0F0/gi, "var(--border-light)");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
}

function walkDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      processFile(fullPath);
    }
  });
}

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkDir(dir);
  }
});

console.log("Refactoring complete.");
