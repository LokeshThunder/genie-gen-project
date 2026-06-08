const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

console.log('Running Deep App Analysis...');
const files = walk(srcDir);
let issuesFound = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(__dirname, file);

  // 1. Check for basic React hook imports vs usage
  const hookMatches = content.match(/use[A-Z][a-zA-Z]+/g) || [];
  const uniqueHooks = [...new Set(hookMatches)];
  uniqueHooks.forEach(hook => {
    // If it's a custom hook defined in the same file or standard hook, verify it is defined/imported
    if (hook === 'useRef' || hook === 'useState' || hook === 'useEffect' || hook === 'useMemo' || hook === 'useCallback' || hook === 'useContext') {
      const hookImportPattern = new RegExp(`import.*\\b${hook}\\b.*from\\s+['"]react['"]`);
      if (!hookImportPattern.test(content)) {
        console.warn(`[HOOK ISSUE] ${relativePath} uses ${hook} but might not import it from 'react'`);
        issuesFound++;
      }
    }
  });

  // 2. Check for framer-motion imports vs usage (double verification)
  const hasMotion = content.includes('<motion.') || content.includes('motion(') || content.includes('AnimatePresence');
  const hasMotionImport = content.includes('from \'framer-motion\'') || content.includes('from "framer-motion"');
  if (hasMotion && !hasMotionImport) {
    console.warn(`[MOTION ISSUE] ${relativePath} uses motion/AnimatePresence but does not import it from 'framer-motion'`);
    issuesFound++;
  }

  // 3. Check for relative path imports that might be broken
  const importLines = content.match(/import\s+.*\s+from\s+['"]\..*['"]/g) || [];
  importLines.forEach(line => {
    const pathMatch = line.match(/from\s+['"](.*)['"]/);
    if (pathMatch) {
      let importedPath = pathMatch[1];
      let resolvedPath = path.resolve(path.dirname(file), importedPath);
      
      // Try resolving with common extensions
      let exists = false;
      const extensions = ['', '.js', '.jsx', '.css', '.svg', '.png', '.jpg', '/index.js', '/index.jsx'];
      for (const ext of extensions) {
        if (fs.existsSync(resolvedPath + ext) && !fs.statSync(resolvedPath + ext).isDirectory()) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        console.warn(`[PATH ISSUE] ${relativePath} has potentially broken import: "${line.trim()}"`);
        issuesFound++;
      }
    }
  });
});

console.log(`Deep analysis completed. Issues found: ${issuesFound}`);
