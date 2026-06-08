import fs from 'fs';

const content = fs.readFileSync('C:/Users/my pc/.gemini/antigravity/scratch/job_genie_react/src/screens/AdminDashboard.jsx', 'utf8');
const lines = content.split('\n');

console.log("=== SEARCHING AdminDashboard.jsx ===");
lines.forEach((line, index) => {
  if (line.includes('Create') || line.includes('create') || line.includes('Post') || line.includes('post') || line.includes('FIND WORKERS')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
