# 🔧 Solução de Problemas - Dashboard

## Problema: Erro nas Funções RPC

Se você está recebendo erros como:
```
Error: Erro ao buscar dados diários: {}
```

## Soluções:

### 1. **Execute o Script SQL Atualizado**

Primeiro, execute o script `dashboard-functions-alternative.sql` no SQL Editor do Supabase:

```sql
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
```

### 2. **Use o Componente de Teste**

O dashboard agora inclui um componente de teste que você pode usar para verificar se as funções estão funcionando:

1. Acesse `/dash`
2. Role até o final da página
3. Use os botões "Testar Funções RPC" e "Testar Queries Diretas"
4. Verifique os resultados

### 3. **Fallback Automático**

O dashboard foi atualizado para usar automaticamente queries diretas caso as funções RPC falhem. Isso significa que mesmo se as funções RPC não funcionarem, o dashboard ainda vai mostrar os dados.

### 4. **Verificar Estrutura das Tabelas**

Certifique-se de que suas tabelas têm as colunas corretas:

**Tabela `pedidos`:**
- `id`
- `created_at` (ou `data_pedido`)
- `total`
- `taxa_entrega` (ou `taxa_entraga`)

**Tabela `itens`:**
- `id`
- `pedido_id`
- `nome`
- `qtd`

### 5. **Testar Manualmente no SQL Editor**

Execute estas queries no SQL Editor do Supabase para verificar se os dados existem:

```sql
-- Verificar se há pedidos
SELECT COUNT(*) FROM pedidos;

-- Verificar se há itens
SELECT COUNT(*) FROM itens;

-- Verificar estrutura da tabela pedidos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pedidos';

-- Verificar estrutura da tabela itens
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'itens';
```

### 6. **Logs de Debug**

Abra o console do navegador (F12) e verifique os logs. O dashboard agora mostra informações detalhadas sobre:
- Quais funções estão sendo chamadas
- Se está usando RPC ou queries diretas
- Erros específicos que estão ocorrendo

## Status Atual

✅ **Dashboard atualizado** com fallback automático
✅ **Componente de teste** para diagnóstico
✅ **Logs detalhados** para debugging
✅ **Queries diretas** como backup

O dashboard deve funcionar mesmo se as funções RPC não estiverem disponíveis! 