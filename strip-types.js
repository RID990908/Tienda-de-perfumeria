const fs = require('fs');
const path = require('path');

function stripTypes(content) {
  let stripped = content;

  // 1. Remove interfaces and types (multiline)
  stripped = stripped.replace(/export\s+(interface|type)\s+\w+[\s\S]*?(\n\n|\n$|(?=\nexport)|(?=\nimport)|(?=\r\n\r\n))/g, '');
  stripped = stripped.replace(/(interface|type)\s+\w+[\s\S]*?(\n\n|\n$|(?=\nexport)|(?=\nimport)|(?=\r\n\r\n))/g, '');

  // 2. Remove 'as ...' casts - EXCLUDING import aliases
  // We only match 'as' if it's followed by 'const' or an Uppercase type, 
  // and NOT preceded by '*' or inside '{}' in an import (though that's harder).
  // Let's just match 'as const' and 'as [A-Z]'
  stripped = stripped.replace(/\s+as\s+(const|[A-Z][A-Za-z0-9]*)\b/g, '');

  // 3. Remove generic types <...>
  let prev;
  do {
    prev = stripped;
    stripped = stripped.replace(/<[^<>]+>/g, '');
  } while (stripped !== prev);

  // 4. Remove type annotations
  // Remove ": Type" where Type is one of the common ones or starts with Uppercase
  stripped = stripped.replace(/:\s*(NextRequest|NextResponse|Promise|void|string|number|boolean|any|unknown|never|object|symbol|T|U|Record|Partial|Omit|Pick|['"]\w+['"]\s*\|\s*['"]\w+['"])\b/g, '');
  
  // Remove remaining ": Type" in params/decls (more targeted)
  // Matches "var: Type" but not in object literals (approximate)
  stripped = stripped.replace(/(\b\w+)\s*:\s*[A-Z][A-Za-z0-9_$|[\]{}<>\s'"]+(?=[,)=;{])/g, '$1');

  // 5. Remove accessibility modifiers
  stripped = stripped.replace(/\b(public|private|protected|readonly|abstract)\s+/g, '');

  // 6. Remove 'implements ...'
  stripped = stripped.replace(/\s+implements\s+[A-Z][A-Za-z0-9]*/g, '');

  // Cleanup: dual colons or empty parens with spaces
  stripped = stripped.replace(/\(\s*\)/g, '()');
  
  return stripped;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDir(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const stripped = stripTypes(content);
      fs.writeFileSync(fullPath, stripped, 'utf8');
    }
  }
}

const targetDirs = [
  path.join(__dirname, 'backend', 'src'),
  path.join(__dirname, 'frontend', 'src'),
  path.join(__dirname, 'backend', 'middleware.js'),
  path.join(__dirname, 'frontend', 'middleware.js')
];

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    if (fs.statSync(dir).isDirectory()) {
      processDir(dir);
    } else {
      const content = fs.readFileSync(dir, 'utf8');
      const stripped = stripTypes(content);
      fs.writeFileSync(dir, stripped, 'utf8');
    }
  }
});
console.log("Conversion complete.");
