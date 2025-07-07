-- Script para verificar a estrutura da tabela pedidos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'pedidos';

-- 3. Verificar RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'pedidos';

-- 4. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'pedidos';

-- 5. Tentar inserir um registro de teste
INSERT INTO pedidos (status, subtotal, total, pagamento) 
VALUES ('Teste', 10.00, 10.00, 'dinheiro')
RETURNING *;

-- 6. Se funcionar, deletar o teste
DELETE FROM pedidos WHERE status = 'Teste'; 