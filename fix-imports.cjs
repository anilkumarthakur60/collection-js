const fs = require('fs');
const path = require('path');

const traverse = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/from '\.\.\/Collection'/g, "from '../src/Collection'");
      content = content.replace(/from '\.\.\/LazyCollection'/g, "from '../src/LazyCollection'");
      content = content.replace(/from '\.\.\/collect'/g, "from '../src/collect'");
      content = content.replace(/from '\.\.\/types/g, "from '../src/types");
      fs.writeFileSync(fullPath, content);
    }
  }
};

traverse(path.join(__dirname, 'tests'));
console.log('Fixed imports in tests');
