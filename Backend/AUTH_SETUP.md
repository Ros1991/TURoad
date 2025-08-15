# 🔐 Sistema de Autenticação - Configuração para Banco de Dados Real

## 📋 Resumo das Correções

O sistema de autenticação foi completamente refatorado para funcionar com o banco de dados PostgreSQL real, removendo dados mockados.

### ✅ Correções Realizadas

1. **AuthController** - Removidos métodos de recuperação de senha (dependiam de campo `email` inexistente)
2. **AuthService** - Corrigidos imports e removidos métodos problemáticos  
3. **UserRepository** - Removido método `updateLastLogin` (campo inexistente)
4. **UserMapper** - Corrigido para não referenciar `createdAt/updatedAt` inexistentes
5. **UserResponseDto** - Não herda mais `BaseResponseDto` pois User não tem timestamps
6. **Routes** - Removidas rotas de recovery de senha

### 🌱 Sistema de Seeds

- **UserSeed.ts** - Cria usuário admin padrão se não existir nenhum usuário
- **SeedRunner** - Executa todos os seeds automaticamente na inicialização

## 🚀 Como Usar

### 1. Configurar Banco de Dados
```bash
# Copie e configure o arquivo .env
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL
```

### 2. Executar Migrações e Seeds
```bash
# O sistema executará automaticamente seeds na inicialização
npm run start:dev

# Ou execute seeds manualmente
npm run seed
```

### 3. Usuário Padrão Criado
- **Username:** `admin`
- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** Administrator
- ⚠️ **IMPORTANTE:** Altere a senha padrão após primeiro login!

### 4. Testar Sistema de Autenticação
```bash
# Execute teste completo do sistema de auth
npm run test:auth
```

## 🔧 Scripts Disponíveis

- `npm run seed` - Executa seeds manualmente
- `npm run test:auth` - Testa sistema de autenticação completo
- `npm run start:dev` - Inicia servidor com seeds automáticos

## 📡 Endpoints de Autenticação

### Públicos
- `POST /api/v1/auth/login` - Login com email/username + password
- `POST /api/v1/auth/register` - Registro de novo usuário (requer email único)
- `POST /api/v1/auth/refresh-token` - Renovar token
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/validate-token` - Validar token

### Protegidos (requer autenticação)
- `GET /api/v1/auth/profile` - Perfil do usuário
- `POST /api/v1/auth/change-password` - Alterar senha
- `POST /api/v1/auth/logout-all` - Logout de todos dispositivos
- `GET /api/v1/auth/tokens` - Listar tokens ativos
- `DELETE /api/v1/auth/tokens/:tokenHash` - Revogar token específico

### Admin (requer role admin)
- `POST /api/v1/auth/cleanup-tokens` - Limpar tokens expirados

## ✅ Status
Sistema completamente funcional com banco de dados PostgreSQL real.
