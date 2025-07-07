-- Script para verificar a estrutura do banco de dados
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se as tabelas existem
SELECT 
  table_name,
  'EXISTE' as status
FROM information_schema.tables 
WHERE table_name IN ('pedidos', 'itens')
ORDER BY table_name;

-- 2. Verificar estrutura da tabela pedidos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela itens
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'itens'
ORDER BY ordinal_position;

-- 4. Verificar se há dados nas tabelas
SELECT 
  'pedidos' as tabela,
  COUNT(*) as total_registros
FROM pedidos
UNION ALL
SELECT 
  'itens' as tabela,
  COUNT(*) as total_registros
FROM itens;

-- 5. Verificar se as funções RPC existem
SELECT 
  routine_name,
  routine_type,
  'EXISTE' as status
FROM information_schema.routines 
WHERE routine_name IN ('orders_by_day', 'orders_summary', 'top_products')
ORDER BY routine_name;

-- 6. Testar uma query simples para ver se os dados estão acessíveis
SELECT 
  'teste_pedidos' as teste,
  COUNT(*) as total,
  MIN(created_at) as data_mais_antiga,
  MAX(created_at) as data_mais_recente
FROM pedidos
LIMIT 1; 