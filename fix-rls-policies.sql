-- Script para corrigir as políticas de RLS do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos desabilitar RLS temporariamente para testar
alter table pedidos disable row level security;
alter table itens disable row level security;
alter table configuracao disable row level security;

-- 2. Verificar se conseguimos inserir dados
insert into configuracao default values on conflict do nothing;

-- 3. Agora vamos reabilitar RLS com políticas corretas
alter table pedidos enable row level security;
alter table itens enable row level security;
alter table configuracao enable row level security;

-- 4. Remover políticas antigas (se existirem)
drop policy if exists "Permitir inserção de pedidos para todos" on pedidos;
drop policy if exists "Permitir leitura de pedidos para todos" on pedidos;
drop policy if exists "Permitir atualização de pedidos para todos" on pedidos;

drop policy if exists "Permitir inserção de itens para todos" on itens;
drop policy if exists "Permitir leitura de itens para todos" on itens;
drop policy if exists "Permitir atualização de itens para todos" on itens;

drop policy if exists "Permitir leitura de configuração para todos" on configuracao;

-- 5. Criar políticas mais permissivas
-- Para a tabela pedidos
create policy "pedidos_insert_policy" on pedidos
  for insert with check (true);

create policy "pedidos_select_policy" on pedidos
  for select using (true);

create policy "pedidos_update_policy" on pedidos
  for update using (true);

create policy "pedidos_delete_policy" on pedidos
  for delete using (true);

-- Para a tabela itens
create policy "itens_insert_policy" on itens
  for insert with check (true);

create policy "itens_select_policy" on itens
  for select using (true);

create policy "itens_update_policy" on itens
  for update using (true);

create policy "itens_delete_policy" on itens
  for delete using (true);

-- Para a tabela configuracao
create policy "configuracao_select_policy" on configuracao
  for select using (true);

create policy "configuracao_insert_policy" on configuracao
  for insert with check (true);

create policy "configuracao_update_policy" on configuracao
  for update using (true);

-- 6. Verificar se as políticas foram criadas
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where tablename in ('pedidos', 'itens', 'configuracao')
order by tablename, policyname;

-- 7. Teste de inserção
insert into pedidos (status, subtotal, desconto, taxa_entrega, total, pagamento, obs, cliente)
values (
  'Pendente',
  15.00,
  0,
  3.00,
  18.00,
  'dinheiro',
  'Pedido de teste via SQL',
  '{"nome": "Cliente Teste SQL", "telefone": "27997202130", "endereco": "Endereço de teste", "distancia": 2.5}'::jsonb
);

-- 8. Verificar se o pedido foi criado
select * from pedidos order by criado_em desc limit 1; 