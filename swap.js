const fs = require('fs');
const path = 'c:\\\\Users\\\\user\\\\ecasi_africa\\\\src\\\\pages\\\\Index.jsx';
let content = fs.readFileSync(path, 'utf8');

const eventsStart = content.indexOf('        {/* ── Upcoming Events ── */}');
const partnersStart = content.indexOf('        {/* ── Partners Section ── */}');
const linkedInStart = content.indexOf('        {/* ── LinkedIn Feed ── */}');

if (eventsStart !== -1 && partnersStart !== -1 && linkedInStart !== -1) {
  const eventsEnd = content.lastIndexOf('\n', partnersStart);
  const eventsText = content.substring(eventsStart, eventsEnd);
  
  const partnersEnd = content.lastIndexOf('\n', linkedInStart);
  const partnersText = content.substring(partnersStart, partnersEnd);
  
  const prefix = content.substring(0, eventsStart);
  const suffix = content.substring(partnersEnd);
  
  const newContent = prefix + partnersText + '\n\n' + eventsText + suffix;
  
  fs.writeFileSync(path, newContent, 'utf8');
  console.log('Successfully swapped sections.');
} else {
  console.log('Could not find sections.');
}
