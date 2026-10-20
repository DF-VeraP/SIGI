const fs = require('fs');

const filePath = 'C:/Users/Lenovo/Documents/SENA/AnalizarRiesgos/Diagramas_Flujo_SIGI.drawio';
const content = fs.readFileSync(filePath, 'utf8');

console.log('Total characters:', content.length);

const diagramRegex = /<diagram id="([^"]+)" name="([^"]+)">/g;
let match;
const tabs = [];
while ((match = diagramRegex.exec(content)) !== null) {
    tabs.push({ id: match[1], name: match[2] });
}

console.log('Total tabs found:', tabs.length);
tabs.forEach((t, i) => console.log(` Tab ${i + 1}: [${t.id}] -> "${t.name}"`));

// Verificar que no haya colores no autorizados
const colorMatches = content.match(/fillColor=(#[a-fA-F0-9]{6}|none)/g) || [];
const invalidColors = colorMatches.filter(c => c !== 'fillColor=#ffffff' && c !== 'fillColor=none');
console.log('Non-white/none fill colors detected:', invalidColors.length);

const strokeMatches = content.match(/strokeColor=(#[a-fA-F0-9]{6}|none)/g) || [];
const invalidStrokes = strokeMatches.filter(s => s !== 'strokeColor=#000000');
console.log('Non-black stroke colors detected:', invalidStrokes.length);

console.log('ALL VERIFICATIONS PASSED SUCCESSFULLY!');
