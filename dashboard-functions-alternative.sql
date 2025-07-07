-- Funções RPC Alternativas para o Dashboard do Açaí da Mary & Cia
-- Execute este script no SQL Editor do Supabase

-- Verificar se as tabelas existem
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pedidos') THEN
    RAISE EXCEPTION 'Tabela pedidos não encontrada';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'itens') THEN
    RAISE EXCEPTION 'Tabela itens não encontrada';
  END IF;
END $$;

-- 1. Função para obter pedidos por dia (versão mais robusta)
CREATE OR REPLACE FUNCTION orders_by_day(start_date date, end_date date)
RETURNS TABLE (
  date text,
  orders bigint,
  revenue numeric
) AS $$
BEGIN
  -- Verificar se as datas são válidas
  IF start_date > end_date THEN
    RAISE EXCEPTION 'Data inicial não pode ser maior que a data final';
  END IF;
  
  RETURN QUERY
  SELECT 
    to_char(COALESCE(p."data_pedido", p.created_at)::date, 'DD/MM') as date,
    COUNT(*)::bigint as orders,
    COALESCE(SUM(p.total), 0) as revenue
  FROM pedidos p
  WHERE COALESCE(p."data_pedido", p.created_at)::date BETWEEN start_date AND end_date
  GROUP BY COALESCE(p."data_pedido", p.created_at)::date
  ORDER BY COALESCE(p."data_pedido", p.created_at)::date;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para obter resumo dos pedidos (versão mais robusta)
CREATE OR REPLACE FUNCTION orders_summary(start_date date, end_date date)
RETURNS TABLE (
  orders bigint,
  revenue numeric,
  deliveryfees numeric
) AS $$
BEGIN
  -- Verificar se as datas são válidas
  IF start_date > end_date THEN
    RAISE EXCEPTION 'Data inicial não pode ser maior que a data final';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::bigint as orders,
    COALESCE(SUM(p.total), 0) as revenue,
    COALESCE(SUM(COALESCE(p."taxa_entraga", p.taxa_entrega)), 0) as deliveryfees
  FROM pedidos p
  WHERE COALESCE(p."data_pedido", p.created_at)::date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para obter produtos mais vendidos (versão mais robusta)
CREATE OR REPLACE FUNCTION top_products(start_date date, end_date date, limit_rows int DEFAULT 5)
RETURNS TABLE (
  product text,
  quantity bigint
) AS $$
BEGIN
  -- Verificar se as datas são válidas
  IF start_date > end_date THEN
    RAISE EXCEPTION 'Data inicial não pode ser maior que a data final';
  END IF;
  
  -- Verificar se limit_rows é válido
  IF limit_rows <= 0 THEN
    limit_rows := 5;
  END IF;
  
  RETURN QUERY
  SELECT 
    i.nome as product,
    SUM(i.qtd)::bigint as quantity
  FROM itens i
  JOIN pedidos p ON i.pedido_id = p.id
  WHERE COALESCE(p."data_pedido", p.created_at)::date BETWEEN start_date AND end_date
  GROUP BY i.nome
  ORDER BY quantity DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql;

-- Função de teste para verificar se tudo está funcionando
CREATE OR REPLACE FUNCTION test_dashboard_functions()
RETURNS TABLE (
  function_name text,
  status text,
  message text
) AS $$
BEGIN
  -- Testar orders_by_day
  BEGIN
    PERFORM * FROM orders_by_day('2024-01-01', '2024-12-31') LIMIT 1;
    RETURN QUERY SELECT 'orders_by_day'::text, 'OK'::text, 'Função funcionando'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'orders_by_day'::text, 'ERRO'::text, SQLERRM::text;
  END;
  
  -- Testar orders_summary
  BEGIN
    PERFORM * FROM orders_summary('2024-01-01', '2024-12-31') LIMIT 1;
    RETURN QUERY SELECT 'orders_summary'::text, 'OK'::text, 'Função funcionando'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'orders_summary'::text, 'ERRO'::text, SQLERRM::text;
  END;
  
  -- Testar top_products
  BEGIN
    PERFORM * FROM top_products('2024-01-01', '2024-12-31', 5) LIMIT 1;
    RETURN QUERY SELECT 'top_products'::text, 'OK'::text, 'Função funcionando'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'top_products'::text, 'ERRO'::text, SQLERRM::text;
  END;
END;
$$ LANGUAGE plpgsql; 