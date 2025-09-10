# Environment Variables Setup

## Configuração de Variáveis de Ambiente

Para configurar a URL da API, crie um arquivo `.env` na raiz do projeto frontend com as seguintes variáveis:

```env
# API Configuration
VITE_API_URL=https://avrek-calls-production.up.railway.app
VITE_API_URL_DEV=http://localhost:3001

# Environment
VITE_NODE_ENV=production
```

## Variáveis Disponíveis

- `VITE_API_URL`: URL da API em produção (padrão: Railway)
- `VITE_API_URL_DEV`: URL da API para desenvolvimento local
- `VITE_NODE_ENV`: Ambiente atual (production/development)

## Como Usar

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` com suas configurações

3. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Fallback

Se as variáveis de ambiente não estiverem definidas, o sistema usará os valores padrão:
- Produção: `https://avrek-calls-production.up.railway.app`
- Desenvolvimento: `http://localhost:3001`



