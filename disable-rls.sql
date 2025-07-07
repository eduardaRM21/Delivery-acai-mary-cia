-- Script para desabilitar RLS completamente
-- Execute este script no SQL Editor do Supabase
-- Esta é a solução mais simples para desenvolvimento

-- Desabilitar RLS em todas as tabelas
alter table pedidos disable row level security;
alter table itens disable row level security;
alter table configuracao disable row level security;

-- Verificar se RLS está desabilitado
select 
  schemaname,
  tablename,
  rowsecurity
from pg_tables 
where tablename in ('pedidos', 'itens', 'configuracao');

-- Inserir dados de teste para verificar
insert into configuracao default values on conflict do nothing;

insert into pedidos (status, subtotal, desconto, taxa_entrega, total, pagamento, obs, cliente)
values (
  'Pendente',
  15.00,
  0,
  3.00,
  18.00,
  'dinheiro',
  'Pedido de teste sem RLS',
  '{"nome": "Cliente Teste", "telefone": "27997202130", "endereco": "Endereço de teste", "distancia": 2.5}'::jsonb
);

-- Verificar se funcionou
select 
  'pedidos' as tabela,
  count(*) as registros
from pedidos
union all
select 
  'configuracao' as tabela,
  count(*) as registros
from configuracao; 