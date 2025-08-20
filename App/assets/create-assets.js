const fs = require('fs');
const path = require('path');

// Função para criar um SVG simples como placeholder
function createSVGIcon(size, text, bgColor = '#035A6E', textColor = '#FFFFFF') {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" rx="20"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.floor(size/8)}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
</svg>`;
}

function createSplashSVG() {
  return `<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <g transform="translate(642, 1389)">
    <circle r="150" fill="#035A6E"/>
    <text x="0" y="10" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
          text-anchor="middle" dominant-baseline="middle" fill="#FFFFFF">TURoad</text>
  </g>
  <text x="642" y="1600" font-family="Arial, sans-serif" font-size="24" 
        text-anchor="middle" dominant-baseline="middle" fill="#035A6E">Descubra o turismo local</text>
</svg>`;
}

// Criar os SVGs
const assets = [
  { name: 'icon.svg', content: createSVGIcon(1024, 'TR') },
  { name: 'adaptive-icon.svg', content: createSVGIcon(1024, 'TR') },
  { name: 'favicon.svg', content: createSVGIcon(48, 'T') },
  { name: 'splash.svg', content: createSplashSVG() }
];

assets.forEach(asset => {
  fs.writeFileSync(asset.name, asset.content);
  console.log(`✅ Criado: ${asset.name}`);
});

console.log('\n🎨 Assets SVG criados com sucesso!');
console.log('📝 Para usar, você pode:');
console.log('1. Converter SVG para PNG usando ferramentas online');
console.log('2. Substituir por seus assets reais');
console.log('3. Usar como estão (Expo suporta SVG)');
