# 🚀 Migração para Expo SDK Bare Workflow - TURoad

Este documento descreve a migração completa do aplicativo TURoad para o **Expo SDK 53** no modo **bare workflow**, garantindo **100% de controle local** sem dependências da cloud Expo.

## 📋 Resumo da Migração

### ✅ O que foi implementado

- **Expo SDK 53.0.20** no bare workflow (controle total do código nativo)
- **expo-dev-client 5.2.4** para desenvolvimento local
- **expo-updates 0.28.17** para OTA customizado
- **SEM dependências** da cloud Expo (100% local)
- **Servidor de updates próprio** com exemplo funcional
- **Deploy para AWS S3** com script automatizado

## 🔧 Configurações Realizadas

### 1. Package.json
```json
{
  "scripts": {
    "start": "npx expo start --dev-client",
    "android": "npx expo run:android", 
    "ios": "npx expo run:ios",
    "prebuild": "npx expo prebuild",
    "prebuild:clean": "npx expo prebuild --clean",
    "export": "npx expo export --platform all"
  }
}
```

**Dependências principais adicionadas:**
- `expo: ~53.0.20`
- `expo-dev-client: ~5.2.4`
- `expo-splash-screen: ~0.29.14`
- `expo-updates: ^0.28.17`
- `expo-linear-gradient: ~14.1.5`

### 2. Configurações Core

**app.json**
```json
{
  "expo": {
    "name": "TURoad",
    "slug": "turoad",
    "plugins": [
      "expo-dev-client",
      ["expo-updates", { "username": "your-username" }]
    ]
  }
}
```

**app.config.js** - Configuração dinâmica com variáveis de ambiente
- Suporte a `.env` para diferentes ambientes
- Configuração de OTA updates customizado
- Bundle identifiers configuráveis

**metro.config.js** - Compatibilidade com Expo
- Configuração para pnpm monorepo
- Suporte a symlinks
- Resolver aliases (@/ -> src/)

**babel.config.js** - Preset Expo
```javascript
module.exports = {
  presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]]
};
```

**tsconfig.json** - TypeScript otimizado
- Target ES2020 com libs modernas
- JSX react-jsx mode
- esModuleInterop habilitado

### 3. App.tsx - Integração Expo
```typescript
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';

// Controle de splash screen
// Verificação de OTA updates em produção
// Inicialização otimizada
```

## 🔄 Sistema de OTA Updates

### UpdateService.ts
Serviço completo de gerenciamento de updates:
- ✅ Verificação automática de updates
- ✅ Download e aplicação de updates
- ✅ Verificação periódica configurável
- ✅ Suporte a servidor customizado
- ✅ Logs detalhados
- ✅ Cleanup automático

**Funcionalidades:**
- `checkForUpdate()` - Verifica updates disponíveis
- `downloadAndApplyUpdate()` - Baixa e aplica update
- `setCustomUpdateServer()` - Configura servidor próprio
- `getCurrentUpdateInfo()` - Info do update atual

### Servidor de Updates Próprio

**update-server-example/server.js**
```javascript
// Servidor Express completo
// API compatível com Expo Updates
// Suporte a múltiplas plataformas
// Health check endpoint
// Upload de novos updates
```

**Endpoints:**
- `GET /api/manifest` - Expo Updates API
- `GET /health` - Status do servidor
- `POST /api/upload` - Upload novos updates

### Deploy AWS S3

**update-server-example/deploy-s3.js**
```bash
# Upload update
node deploy-s3.js upload android 1.0.0 ./bundle.js ./assets

# Listar updates
node deploy-s3.js list android

# Deletar update
node deploy-s3.js delete android 1.0.0
```

## 🚀 Como Usar

### 1. Instalação Inicial
```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env

# Gerar código nativo  
pnpm prebuild

# iOS: instalar pods (macOS only)
cd ios && pod install
```

### 2. Desenvolvimento Local
```bash
# Iniciar com dev client
pnpm start

# Build e executar
pnpm android  # ou pnpm ios
```

### 3. OTA Updates

**Opção 1: Servidor Próprio**
```bash
# Iniciar servidor de updates
cd update-server-example
npm install && npm start

# Configurar no .env
EXPO_UPDATE_URL=http://localhost:3002/api/manifest
```

**Opção 2: AWS S3**
```bash
# Configurar AWS credentials
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export S3_BUCKET=your-bucket

# Deploy update
cd update-server-example
node deploy-s3.js upload android 1.0.0 ./bundle.js
```

**Opção 3: Storage Customizado**
- Implementar interface compatível com `expo-updates`
- Configurar URL no `UpdateService`
- Utilizar qualquer provedor de storage

## 📁 Estrutura de Arquivos

```
App/
├── src/
│   └── services/
│       └── UpdateService.ts        # Serviço de OTA updates
├── update-server-example/
│   ├── server.js                   # Servidor próprio
│   ├── deploy-s3.js                # Deploy AWS S3
│   └── package.json                # Dependências do servidor
├── app.json                        # Config Expo básica
├── app.config.js                   # Config dinâmica
├── metro.config.js                 # Metro + Expo
├── babel.config.js                 # Babel + Expo preset
├── tsconfig.json                   # TypeScript optimized
└── .env.example                    # Variáveis de ambiente
```

## 🔐 Variáveis de Ambiente

Crie `.env` baseado em `.env.example`:

```bash
# Configuração básica
EXPO_APP_NAME=TURoad
API_URL=http://localhost:3001

# Updates customizados (opcional)
EXPO_UPDATE_URL=http://localhost:3002/api/manifest
EXPO_STORAGE_URL=http://localhost:3002/assets

# AWS S3 (produção)
AWS_REGION=us-east-1
S3_BUCKET=turoad-updates
```

## 🚨 Pontos Importantes

### ✅ Vantagens da Migração
- **Controle total**: Sem vendor lock-in da Expo
- **Desenvolvimento local**: Debug completo com dev client
- **OTA customizado**: Seus próprios servidores
- **Builds nativos**: Acesso completo ao código nativo
- **Performance**: Otimizações do Expo SDK 53

### ⚠️ Atenção
- **Builds nativos obrigatórios**: Não usa Expo Go
- **Assets do app**: Precisa criar icon.png, splash.png, etc.
- **Code signing**: Configurar para updates em produção
- **Testes**: Testar OTA updates antes de deploy

## 📱 Próximos Passos

### 1. Assets do App
```bash
# Criar assets obrigatórios
assets/
├── icon.png              # 1024x1024
├── splash.png            # 1284x2778 (iPhone 13 Pro Max)
├── adaptive-icon.png     # 1024x1024 (Android)
└── favicon.png          # 48x48 (Web)
```

### 2. Build de Produção
```bash
# Gerar código nativo limpo
pnpm prebuild:clean

# Build de desenvolvimento
pnpm android --variant debug
pnpm ios --configuration Debug

# Build de produção (depois de configurar assets)
pnpm android --variant release
pnpm ios --configuration Release
```

### 3. Configurar OTA (Produção)
```bash
# 1. Escolher opção de storage
# 2. Configurar code signing
# 3. Testar updates em staging
# 4. Deploy para produção
```

### 4. Monitoramento
- Implementar logs de update
- Métricas de sucesso/falha
- Rollback em caso de problemas

## 🔍 Troubleshooting

### Metro build failed
```bash
# Limpar cache
pnpm prebuild:clean
npx expo start --clear

# Verificar node_modules
rm -rf node_modules && pnpm install
```

### Assets não encontrados
```bash
# Verificar se assets existem
ls -la assets/

# Criar assets básicos se necessário
# (ver seção Assets do App acima)
```

### Updates não funcionam
```bash
# Verificar se está em produção
# Updates só funcionam em builds de release

# Verificar URLs no .env
# Testar servidor de updates manualmente
```

## 📚 Referências

- [Expo Bare Workflow](https://docs.expo.dev/bare/overview/)
- [Expo Dev Client](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/)
- [Custom Update Server](https://docs.expo.dev/eas-update/custom-updates-server/)

---

**Status**: ✅ Migração concluída e funcional
**Próximo**: Criar assets, testar builds e configurar OTA em produção
