# Açaí da Mary & Cia - Sistema de Pedidos

Sistema completo para gerenciamento de pedidos de açaí com painel administrativo, cálculo de entrega e impressão térmica.

## 🚀 Funcionalidades

### Para o Cliente
- ✅ Catálogo de produtos com personalização
- ✅ Cálculo automático de taxa de entrega por km
- ✅ Sistema de pedidos via WhatsApp
- ✅ Histórico de pedidos por telefone
- ✅ Confirmação de endereço

### Para o Administrador
- ✅ Painel de administração completo
- ✅ Gerenciamento de status dos pedidos
- ✅ Impressão térmica de pedidos
- ✅ Estatísticas em tempo real
- ✅ Filtros e busca avançada
- ✅ Área específica para motoboys

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI, Shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Impressão**: API de impressão do navegador
- **Deploy**: Vercel (recomendado)

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta no Vercel (opcional, para deploy)

## ⚙️ Configuração

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd mary-cia
npm install
```

### 2. Configure o Supabase

#### 2.1 Crie um projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima

#### 2.2 Execute o SQL para criar as tabelas
No SQL Editor do Supabase, execute:

```sql
-- Pedidos
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero int generated always as identity,
  criado_em timestamptz not null default now(),
  status text not null default 'Pendente',
  subtotal numeric(10,2) not null,
  desconto numeric(10,2) not null default 0,
  taxa_entrega numeric(10,2) not null,
  total numeric(10,2) not null,
  pagamento text,
  obs text,
  cliente jsonb not null
);

-- Itens
create table itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  nome text not null,
  qtd int not null,
  preco numeric(10,2) not null,
  adicionais jsonb
);

-- Configuração
create table configuracao (
  id int primary key default 1,
  taxa_base numeric(10,2) not null default 2.5,
  preco_por_km numeric(10,2) not null default 1,
  endereco_loja text not null default 'Rua Resplendor, 85, Nova Caparapina I, Serra - ES'
);

insert into configuracao default values on conflict do nothing;

-- Desabilitar RLS completamente
alter table pedidos disable row level security;
alter table itens disable row level security;
alter table configuracao disable row level security;
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Google Maps API (opcional, para cálculo preciso de distância)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps

# Configurações da loja
NEXT_PUBLIC_STORE_ADDRESS="Rua Resplendor, 85, Nova Caparapina I, Serra - ES"
NEXT_PUBLIC_STORE_PHONE="5527988646488"
```

### 4. Configure as coordenadas da loja

No arquivo `lib/delivery.ts`, atualize as coordenadas da sua loja:

```typescript
const STORE_COORDINATES = {
  lat: -20.1234, // Substitua pela latitude real
  lng: -40.5678  // Substitua pela longitude real
}
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📱 Como usar

### Painel Administrativo
Acesse `/admin` para gerenciar pedidos:
- Visualizar todos os pedidos
- Atualizar status (Pendente → Confirmado → Preparando → Pronto → Entregando → Entregue)
- Imprimir pedidos
- Filtrar por status
- Buscar por número, cliente ou telefone

### Fluxo de Pedido
1. Cliente acessa o site
2. Escolhe produtos e personalizações
3. Informa dados de entrega
4. Sistema calcula taxa de entrega automaticamente
5. Pedido é enviado via WhatsApp
6. Administrador recebe no painel
7. Atualiza status conforme preparo
8. Imprime pedido quando necessário

## 🔧 Personalização

### Produtos
Edite o array `products` em `app/page.tsx` para adicionar/remover produtos.

### Coberturas e Complementos
Edite os arrays em `components/product-modal.tsx`:
- `toppings` (coberturas)
- `fruits` (frutas)
- `extras` (complementos)
- `additionals` (adicionais pagos)

### Taxa de Entrega
Configure no banco de dados na tabela `configuracao`:
- `taxa_base`: Taxa fixa de entrega
- `preco_por_km`: Preço por quilômetro adicional

### Horários de Funcionamento
Edite a função `checkIfStoreIsOpen()` em `app/page.tsx`.

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato via WhatsApp: (27) 98864-6488

## 📄 Licença

Este projeto é de uso livre para o Açaí da Mary & Cia.

---

**Desenvolvido com ❤️ para o Açaí da Mary & Cia** 