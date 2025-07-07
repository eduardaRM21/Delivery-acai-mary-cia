# Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Maps API Key (for delivery area)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Store Information
NEXT_PUBLIC_STORE_NAME=Açai da Mary & Cia
NEXT_PUBLIC_STORE_PHONE=27988646488
NEXT_PUBLIC_STORE_ADDRESS=Rua Resplendor, 85, Nova Caparapina I, Serra - ES
NEXT_PUBLIC_STORE_WHATSAPP=27988646488

# Delivery Configuration
NEXT_PUBLIC_DELIVERY_FEE_PER_KM=2.00
NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD=30.00
```

## Como obter as credenciais do Supabase:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a "Project URL" para `NEXT_PUBLIC_SUPABASE_URL`
5. Copie a "anon public" key para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Como obter a API Key do Google Maps:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Ative a Maps JavaScript API
4. Crie uma chave de API
5. Configure as restrições de domínio se necessário

## Após configurar:

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `/test` para verificar se a conexão está funcionando
3. Execute os scripts SQL para configurar o banco de dados 