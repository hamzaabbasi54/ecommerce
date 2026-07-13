const fs = require('fs');
const xml = fs.readFileSync('c:/Users/hamza/Desktop/ecommerce/temp_docx/word/document.xml', 'utf8');
const text = xml.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
fs.writeFileSync('c:/Users/hamza/Desktop/ecommerce/requirements.txt', text);
console.log('Done');
