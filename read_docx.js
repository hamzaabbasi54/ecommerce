const fs = require('fs');
const unzipper = require('unzipper');

async function readDocx(path) {
  try {
    const zip = fs.createReadStream(path).pipe(unzipper.Parse({forceStream: true}));
    for await (const entry of zip) {
      if (entry.path === 'word/document.xml') {
        const content = await entry.buffer();
        const xml = content.toString('utf8');
        const text = xml.replace(/<w:p [^>]*>/g, '\n').replace(/<[^>]+>/g, '');
        console.log(text);
        entry.autodrain();
        return;
      } else {
        entry.autodrain();
      }
    }
  } catch (e) {
    console.error(e);
  }
}

readDocx(process.argv[2]);
