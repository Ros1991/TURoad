# Como Criar os Assets Obrigatórios - TURoad

## ❌ Erro Atual
O `pnpm prebuild:clean` está falhando porque faltam os seguintes arquivos:

```
./assets/icon.png           (1024x1024px)
./assets/adaptive-icon.png   (1024x1024px) 
./assets/splash.png          (1284x2778px)
./assets/favicon.png         (48x48px)
```

## ✅ Soluções Rápidas

### Opção 1: Download Manual (Mais Rápido)
Baixe placeholders temporários:

1. **icon.png**: https://via.placeholder.com/1024x1024/035A6E/FFFFFF?text=TR
2. **adaptive-icon.png**: https://via.placeholder.com/1024x1024/035A6E/FFFFFF?text=TR  
3. **splash.png**: https://via.placeholder.com/1284x2778/FFFFFF/035A6E?text=TURoad
4. **favicon.png**: https://via.placeholder.com/48x48/035A6E/FFFFFF?text=T

Salve cada arquivo na pasta `assets/` com o nome correto.

### Opção 2: Ferramentas Online
- **AppIcon.co**: https://appicon.co/ (gera todos os tamanhos)
- **Figma**: Criar designs personalizados
- **Canva**: Templates de ícones e splash screens

### Opção 3: Usar Logo Existente
Se você tem o logo da TURoad:
1. Redimensione para 1024x1024px (ícone)
2. Crie splash screen 1284x2778px com logo centralizado
3. Favicon 48x48px

## 🎨 Especificações Técnicas

### Icon.png (1024x1024px)
- Formato: PNG com transparência
- Usado para iOS App Store
- Background pode ser transparente

### Adaptive-icon.png (1024x1024px)
- Formato: PNG com transparência  
- Para Android adaptive icons
- Área segura: círculo central de 640px

### Splash.png (1284x2778px)
- Formato: PNG
- Resolução iPhone 12 Pro Max
- Background branco (#FFFFFF)
- Logo/texto centralizado

### Favicon.png (48x48px)
- Formato: PNG
- Para versão web do app
- Versão simplificada do ícone

## 🚀 Após Criar os Assets

1. Verificar se os 4 arquivos estão na pasta `assets/`
2. Executar: `pnpm prebuild:clean`
3. O comando deve funcionar sem erros

## 🔧 Cores da Marca TURoad
- Primária: `#035A6E` (verde-azulado)
- Secundária: `#002043` (azul escuro)
- Fundo: `#FFFFFF` (branco)
