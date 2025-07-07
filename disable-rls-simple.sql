-- Script simples para desabilitar RLS
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS em todas as tabelas
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('pedidos', 'itens', 'configuracao'); 