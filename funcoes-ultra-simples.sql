-- Funções RPC Ultra-Simples para o Dashboard
-- Execute este script no SQL Editor do Supabase

-- 1. Função para obter pedidos por dia (versão ultra-simples)
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
    COALESCE(SUM(COALESCE(p.total, 0)), 0) as revenue
  FROM pedidos p
  WHERE p.created_at::date >= start_date AND p.created_at::date <= end_date
  GROUP BY p.created_at::date
  ORDER BY p.created_at::date;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para obter resumo dos pedidos (versão ultra-simples)
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
    COALESCE(SUM(COALESCE(p.total, 0)), 0) as revenue,
    COALESCE(SUM(COALESCE(p.taxa_entrega, 0)), 0) as deliveryfees
  FROM pedidos p
  WHERE p.created_at::date >= start_date AND p.created_at::date <= end_date;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para obter produtos mais vendidos (versão ultra-simples)
CREATE OR REPLACE FUNCTION top_products(start_date date, end_date date, limit_rows int DEFAULT 5)
RETURNS TABLE (
  product text,
  quantity bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(i.nome, 'Produto sem nome') as product,
    SUM(COALESCE(i.qtd, 0))::bigint as quantity
  FROM itens i
  JOIN pedidos p ON i.pedido_id = p.id
  WHERE p.created_at::date >= start_date AND p.created_at::date <= end_date
  GROUP BY i.nome
  ORDER BY quantity DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql; 