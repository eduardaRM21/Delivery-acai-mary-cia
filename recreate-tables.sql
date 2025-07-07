-- Script para recriar as tabelas do zero
-- Execute este script no SQL Editor do Supabase

-- 1. Deletar tabelas existentes (se existirem)
DROP TABLE IF EXISTS itens CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS configuracao CASCADE;

-- 2. Criar tabela de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE DEFAULT 'PED' || LPAD(nextval('pedidos_id_seq')::text, 6, '0'),
    status VARCHAR(50) DEFAULT 'Pendente',
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subtotal DECIMAL(10,2) NOT NULL,
    desconto DECIMAL(10,2) DEFAULT 0,
    taxa_entrega DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    pagamento VARCHAR(50) DEFAULT 'dinheiro',
    obs TEXT,
    cliente JSONB,
    endereco_entrega TEXT,
    distancia_km DECIMAL(5,2),
    tempo_entrega INTEGER,
    entregador_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de itens
CREATE TABLE itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    qtd INTEGER NOT NULL DEFAULT 1,
    preco DECIMAL(10,2) NOT NULL,
    adicionais JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de configuração
CREATE TABLE configuracao (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inserir configurações padrão
INSERT INTO configuracao (chave, valor, descricao) VALUES
('taxa_entrega_por_km', '2.00', 'Taxa de entrega por quilômetro'),
('pedido_minimo_entrega', '15.00', 'Valor mínimo para entrega'),
('pedido_minimo_retirada', '10.00', 'Valor mínimo para retirada'),
('tempo_medio_preparo', '15', 'Tempo médio de preparo em minutos'),
('area_entrega_km', '5.00', 'Raio máximo de entrega em km'),
('horario_funcionamento', '{"inicio": "08:00", "fim": "22:00"}', 'Horário de funcionamento'),
('formas_pagamento', '["dinheiro", "pix", "cartao"]', 'Formas de pagamento aceitas');

-- 6. Desabilitar RLS em todas as tabelas
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE itens DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao     DISABLE ROW LEVEL SECURITY;

-- 7. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;

-- 8. Testar inserção
INSERT INTO pedidos (subtotal, total, pagamento) 
VALUES (10.00, 10.00, 'dinheiro')
RETURNING *;

-- 9. Limpar teste
DELETE FROM pedidos WHERE subtotal = 10.00 AND total = 10.00; 