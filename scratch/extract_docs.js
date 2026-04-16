const fs = require('fs');
const path = 'C:\\Users\\my pc\\.gemini\\antigravity\\brain\\3da4a9dc-faa9-40f4-a5ad-97ece0ced7e3\\.system_generated\\steps\\321\\output.txt';

try {
    const data = JSON.parse(fs.readFileSync(path, 'utf8'));
    if (data.documents) {
        data.documents.forEach(doc => {
            console.log(doc.name);
        });
    } else {
        console.log('No documents found');
    }
} catch (e) {
    console.error('Error parsing JSON:', e.message);
}
