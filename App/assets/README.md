# Assets do TURoad

Esta pasta contém os assets necessários para o app Expo:

## Assets Obrigatórios

### 1. **icon.png** (1024x1024px)
- Ícone principal do app
- Formato: PNG com transparência
- Resolução: 1024x1024 pixels
- Usado para iOS e como base para outros ícones

### 2. **adaptive-icon.png** (1024x1024px) 
- Ícone adaptativo para Android
- Formato: PNG com transparência
- Resolução: 1024x1024 pixels
- Deve ter área segura no centro (círculo de 640px)

### 3. **splash.png** (1284x2778px)
- Splash screen do app
- Formato: PNG
- Resolução: 1284x2778 pixels (iPhone 12 Pro Max)
- Background: Branco (#FFFFFF) conforme app.config.js

### 4. **favicon.png** (48x48px)
- Favicon para versão web
- Formato: PNG
- Resolução: 48x48 pixels

## Como Criar

### Opção 1: Usar Ferramentas Online
- **App Icon Generator**: https://appicon.co/
- **Adaptive Icon**: https://romannurik.github.io/AndroidAssetStudio/
- **Splash Screen**: Figma, Canva, ou Photoshop

### Opção 2: Comando `expo install`
```bash
npx expo install expo-splash-screen
```

### Opção 3: Templates
Os arquivos atuais são placeholders. Substitua por:
- Logo/ícone da TURoad
- Cores da marca (#035A6E, #002043)
- Design consistent com o app

## Exemplo de Configuração

Para gerar os assets automaticamente:
```bash
npx expo prebuild --clear
```

Isso criará os assets nativos baseados nos arquivos desta pasta.
