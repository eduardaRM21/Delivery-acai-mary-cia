# Guia de Troubleshooting

## Problema: Erro de RLS (Row Level Security)

**Sintomas:**
- Erro "new row violates row-level security policy"
- Inserções falham mesmo com dados válidos

**Solução:**
1. Execute o script `disable-rls-simple.sql` no SQL Editor do Supabase
2. Ou execute o script `recreate-tables.sql` para recriar tudo do zero

## Problema: Variáveis de ambiente não configuradas

**Sintomas:**
- Erro "Supabase URL not configured"
- Conexão falha

**Solução:**
1. Crie o arquivo `.env.local` na raiz do projeto
2. Configure as variáveis conforme `ENV_SETUP.md`
3. Reinicie o servidor: `npm run dev`

## Problema: Tabelas não existem

**Sintomas:**
- Erro "relation does not exist"
- Tabelas não encontradas

**Solução:**
1. Execute o script `recreate-tables.sql` no SQL Editor do Supabase
2. Verifique se as tabelas foram criadas corretamente

## Problema: Estrutura de dados incorreta

**Sintomas:**
- Erro de tipo de dados
- Campos obrigatórios faltando

**Solução:**
1. Use o componente de teste em `/test`
2. Execute o "Teste Mínimo" primeiro
3. Verifique a estrutura da tabela com `check-table-structure.sql`

## Passos para Debug:

1. **Verificar configuração:**
   - Acesse `/test`
   - Verifique se as variáveis de ambiente estão configuradas

2. **Testar conexão:**
   - Clique em "Testar Conexão"
   - Verifique se todas as tabelas estão acessíveis

3. **Testar inserção mínima:**
   - Clique em "Teste Mínimo"
   - Se falhar, execute os scripts SQL

4. **Verificar logs:**
   - Abra o console do navegador (F12)
   - Verifique os logs detalhados dos erros

## Scripts SQL em ordem de execução:

1. `check-table-structure.sql` - Verificar estrutura atual
2. `disable-rls-simple.sql` - Desabilitar RLS
3. `recreate-tables.sql` - Recriar tudo do zero (se necessário)

## Contato para suporte:

Se os problemas persistirem, verifique:
- Configuração do Supabase
- Permissões do projeto
- Logs do console do navegador
- Logs do Supabase (Dashboard > Logs) 