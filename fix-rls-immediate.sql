-- Script para resolver imediatamente o problema de RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS em todas as tabelas
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('pedidos', 'itens', 'configuracao');

-- 3. Remover todas as policies existentes (se houver)
DROP POLICY IF EXISTS "Enable read access for all users" ON pedidos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON pedidos;
DROP POLICY IF EXISTS "Enable update access for all users" ON pedidos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON pedidos;

DROP POLICY IF EXISTS "Enable read access for all users" ON itens;
DROP POLICY IF EXISTS "Enable insert access for all users" ON itens;
DROP POLICY IF EXISTS "Enable update access for all users" ON itens;
DROP POLICY IF EXISTS "Enable delete access for all users" ON itens;

DROP POLICY IF EXISTS "Enable read access for all users" ON configuracao;
DROP POLICY IF EXISTS "Enable insert access for all users" ON configuracao;
DROP POLICY IF EXISTS "Enable update access for all users" ON configuracao;
DROP POLICY IF EXISTS "Enable delete access for all users" ON configuracao;

-- 4. Testar inserção
INSERT INTO pedidos (subtotal, total, pagamento) 
VALUES (10.00, 10.00, 'dinheiro')
RETURNING *;

-- 5. Limpar teste
DELETE FROM pedidos WHERE subtotal = 10.00 AND total = 10.00;

-- 6. Confirmar que funcionou
SELECT 'RLS desabilitado com sucesso!' as status; 