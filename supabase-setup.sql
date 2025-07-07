-- Script de configuração do Supabase para o Açaí da Mary & Cia
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabelas
-- Pedidos
create table if not exists pedidos (
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
create table if not exists itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  nome text not null,
  qtd int not null,
  preco numeric(10,2) not null,
  adicionais jsonb
);

-- Configuração
create table if not exists configuracao (
  id int primary key default 1,
  taxa_base numeric(10,2) not null default 2.5,
  preco_por_km numeric(10,2) not null default 1,
  endereco_loja text not null default 'Rua Resplendor, 85, Nova Caparapina I, Serra - ES'
);

-- 2. Inserir dados iniciais
insert into configuracao default values on conflict do nothing;

-- 3. Configurar RLS (Row Level Security)
-- Habilitar RLS nas tabelas
alter table pedidos enable row level security;
alter table itens enable row level security;
alter table configuracao enable row level security;

-- 4. Criar políticas de acesso
-- Políticas para a tabela pedidos
create policy "Permitir inserção de pedidos para todos" on pedidos
  for insert with check (true);

create policy "Permitir leitura de pedidos para todos" on pedidos
  for select using (true);

create policy "Permitir atualização de pedidos para todos" on pedidos
  for update using (true);

-- Políticas para a tabela itens
create policy "Permitir inserção de itens para todos" on itens
  for insert with check (true);

create policy "Permitir leitura de itens para todos" on itens
  for select using (true);

create policy "Permitir atualização de itens para todos" on itens
  for update using (true);

-- Políticas para a tabela configuracao
create policy "Permitir leitura de configuração para todos" on configuracao
  for select using (true);

-- 5. Verificar se tudo foi criado corretamente
select 
  'pedidos' as tabela,
  count(*) as registros
from pedidos
union all
select 
  'itens' as tabela,
  count(*) as registros
from itens
union all
select 
  'configuracao' as tabela,
  count(*) as registros
from configuracao;

