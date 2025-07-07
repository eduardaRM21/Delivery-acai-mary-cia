-- Funções RPC para o Dashboard do Açaí da Mary & Cia
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
    to_char(p."data_pedido"::date, 'DD/MM') as date,
    COUNT(*)::bigint as orders,
    COALESCE(SUM(p.total), 0) as revenue
  FROM pedidos p
  WHERE p."data_pedido"::date BETWEEN start_date AND end_date
  GROUP BY p."data_pedido"::date
  ORDER BY p."data_pedido"::date;
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
    COALESCE(SUM(p."taxa_entraga"), 0) as deliveryfees
  FROM pedidos p
  WHERE p."data_pedido"::date BETWEEN start_date AND end_date;
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
  WHERE p."data_pedido"::date BETWEEN start_date AND end_date
  GROUP BY i.nome
  ORDER BY quantity DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql; 