const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src/pages');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Replace text-white in h1-6, p, label
  const regex = /(<(?:h[1-6]|p|label|span|div)\b[^>]*className="[^"]*)\btext-white\b/g;
  const newContent = content.replace(regex, (match, p1) => {
    // If the element has a solid background (bg-indigo, bg-primary, etc.), don't change it.
    if (p1.match(/\bbg-(indigo|primary|blue|red|green|slate-900|black)\b/)) {
        return match;
    }
    changed = true;
    return p1 + 'text-slate-900 dark:text-white';
  });
  
  content = newContent;

  const regex2 = /(<(?:h[1-6]|p|label|span|div)\b[^>]*className="[^"]*)\btext-white\/([0-9]+)\b/g;
  const newContent2 = content.replace(regex2, (match, p1, p2) => {
    if (p1.match(/\bbg-(indigo|primary|blue|red|green|slate-900|black)\b/)) {
        return match;
    }
    changed = true;
    return p1 + 'text-slate-600 dark:text-white/' + p2;
  });
  
  content = newContent2;

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated", file);
  }
});
