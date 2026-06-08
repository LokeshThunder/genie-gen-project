import fs from 'fs';
const content = fs.readFileSync('update_keys.js', 'utf-8');
console.log('reports in update_keys:', content.includes('"reports":') || content.includes('reports:'));
