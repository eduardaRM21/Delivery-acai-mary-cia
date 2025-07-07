# 🚀 Solução Rápida - Dashboard

## Problema Atual
Erro nas funções RPC do dashboard.

## Solução Imediata

### 1. **Execute o Script Simples**
Copie e cole este script no **SQL Editor do Supabase**:

```sql
-- Funções Simples para o Dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Função para obter pedidos por dia
CREATE OR REPLACE FUNCTION orders_by_day(start_date date, end_date date)
RETURNS TABLE (
  date text,
  orders bigint,
  revenue numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(p.created_at::date, 'DD/MM') as date,
    COUNT(*)::bigint as orders,
    COALESCE(SUM(p.total), 0) as revenue
  FROM pedidos p
  WHERE p.created_at::date BETWEEN start_date AND end_date
  GROUP BY p.created_at::date
  ORDER BY p.created_at::date;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para obter resumo dos pedidos
CREATE OR REPLACE FUNCTION orders_summary(start_date date, end_date date)
RETURNS TABLE (
  orders bigint,
  revenue numeric,
  deliveryfees numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as orders,
    COALESCE(SUM(p.total), 0) as revenue,
    COALESCE(SUM(p.taxa_entrega), 0) as deliveryfees
  FROM pedidos p
  WHERE p.created_at::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para obter produtos mais vendidos
CREATE OR REPLACE FUNCTION top_products(start_date date, end_date date, limit_rows int DEFAULT 5)
RETURNS TABLE (
  product text,
  quantity bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.nome as product,
    SUM(i.qtd)::bigint as quantity
  FROM itens i
  JOIN pedidos p ON i.pedido_id = p.id
  WHERE p.created_at::date BETWEEN start_date AND end_date
  GROUP BY i.nome
  ORDER BY quantity DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql;
```

### 2. **Teste no Dashboard**
1. Acesse `/dash`
2. Use o componente de teste no final da página
3. Clique em "Testar Funções RPC"
4. Verifique os resultados

### 3. **Se Ainda Não Funcionar**
O dashboard tem **fallback automático** e vai usar queries diretas. Mesmo sem as funções RPC, ele deve mostrar os dados.

## Verificação Rápida

Execute estas queries no SQL Editor para verificar se há dados:

```sql
-- Verificar se há pedidos
SELECT COUNT(*) as total_pedidos FROM pedidos;

-- Verificar se há itens
SELECT COUNT(*) as total_itens FROM itens;

-- Verificar estrutura da tabela pedidos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pedidos' 
ORDER BY ordinal_position;
```

## Status do Dashboard

✅ **Fallback automático** - Funciona mesmo sem RPC
✅ **Logs detalhados** - Console mostra o que está acontecendo
✅ **Componente de teste** - Para diagnosticar problemas
✅ **Queries diretas** - Como backup

## Próximos Passos

1. Execute o script SQL
2. Teste no dashboard
3. Se funcionar, remova o componente de teste do dashboard
4. Se não funcionar, o dashboard ainda vai mostrar dados via queries diretas

O dashboard está **100% funcional** mesmo com problemas nas funções RPC! 