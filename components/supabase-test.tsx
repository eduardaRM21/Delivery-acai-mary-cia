"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export function SupabaseTest() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<string>("")

  const testConnection = async () => {
    setLoading(true)
    try {
      // Testar conexão básica
      const { data, error } = await supabase
        .from('configuracao')
        .select('*')
        .limit(1)

      if (error) {
        console.error("Erro na configuração:", error)
        throw new Error(`Erro na configuração: ${error.message}`)
      }

      setTestResult("✅ Conexão com Supabase funcionando!")
      toast.success("Conexão com Supabase OK!")
      
      console.log("Dados da configuração:", data)
      
      // Testar se as tabelas existem
      const { data: pedidosTest, error: pedidosError } = await supabase
        .from('pedidos')
        .select('count')
        .limit(1)

      if (pedidosError) {
        console.error("Erro na tabela pedidos:", pedidosError)
        setTestResult("❌ Tabela 'pedidos' não encontrada ou sem permissão")
        toast.error("Tabela 'pedidos' não encontrada")
        return
      }

      const { data: itensTest, error: itensError } = await supabase
        .from('itens')
        .select('count')
        .limit(1)

      if (itensError) {
        console.error("Erro na tabela itens:", itensError)
        setTestResult("❌ Tabela 'itens' não encontrada ou sem permissão")
        toast.error("Tabela 'itens' não encontrada")
        return
      }

      setTestResult("✅ Todas as tabelas estão acessíveis!")
      toast.success("Todas as tabelas OK!")
      
    } catch (error) {
      console.error("Erro na conexão:", error)
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error("Erro na conexão com Supabase")
    } finally {
      setLoading(false)
    }
  }

  const testCreateOrder = async () => {
    setLoading(true)
    try {
      // Testar criação de pedido
      const testOrder = {
        status: 'Pendente',
        subtotal: 15.00,
        desconto: 0,
        taxa_entrega: 3.00,
        total: 18.00,
        pagamento: 'dinheiro',
        obs: 'Pedido de teste',
        cliente: {
          nome: 'Cliente Teste',
          telefone: '27997202130',
          endereco: 'Endereço de teste',
          distancia: 2.5
        }
      }

      console.log("Tentando criar pedido:", testOrder)

      console.log("Tentando inserir pedido:", JSON.stringify(testOrder, null, 2))

      const { data, error } = await supabase
        .from('pedidos')
        .insert(testOrder)
        .select()

      if (error) {
        console.error("Erro detalhado do Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Erro do Supabase: ${error.message} - ${error.details || 'Sem detalhes'} - Código: ${error.code}`)
      }

      setTestResult("✅ Pedido criado com sucesso!")
      toast.success("Pedido de teste criado!")
      
      console.log("Pedido criado:", data)
      
      // Testar criação de item
      if (data && data[0]) {
        const testItem = {
          pedido_id: data[0].id,
          nome: 'Açaí Teste',
          qtd: 1,
          preco: 15.00,
          adicionais: {
            coberturas: ['Leite condensado'],
            frutas: ['Banana'],
            complementos: ['Granola'],
            extras: []
          }
        }

        console.log("Tentando criar item:", testItem)

        const { data: itemData, error: itemError } = await supabase
          .from('itens')
          .insert(testItem)
          .select()

        if (itemError) {
          console.error("Erro ao criar item:", itemError)
          setTestResult("✅ Pedido criado, mas erro ao criar item")
          toast.error("Erro ao criar item")
        } else {
          console.log("Item criado:", itemData)
          setTestResult("✅ Pedido e item criados com sucesso!")
          toast.success("Pedido e item criados!")
        }
      }
      
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error("Detalhes do erro:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      
      setTestResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error("Erro ao criar pedido")
    } finally {
      setLoading(false)
    }
  }

  const testSimpleInsert = async () => {
    setLoading(true)
    try {
      // Teste mais simples - apenas inserir na configuração
      console.log("Testando inserção simples na configuração...")
      
      const { data, error } = await supabase
        .from('configuracao')
        .select('*')
        .limit(1)

      if (error) {
        console.error("Erro ao ler configuração:", error)
        throw new Error(`Erro ao ler configuração: ${error.message}`)
      }

      console.log("Configuração lida com sucesso:", data)
      setTestResult("✅ Leitura da configuração funcionando!")
      toast.success("Leitura funcionando!")
      
    } catch (error) {
      console.error("Erro no teste simples:", error)
      setTestResult(`❌ Erro simples: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error("Erro no teste simples")
    } finally {
      setLoading(false)
    }
  }

  const testMinimalOrder = async () => {
    setLoading(true)
    try {
      // Teste com dados mínimos
      console.log("Testando inserção mínima...")
      
      const minimalOrder = {
        status: 'Pendente',
        subtotal: 10.00,
        total: 10.00,
        pagamento: 'dinheiro'
      }

      console.log("Dados mínimos:", minimalOrder)

      const { data, error } = await supabase
        .from('pedidos')
        .insert(minimalOrder)
        .select()

      if (error) {
        console.error("Erro com dados mínimos:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(`Erro mínimo: ${error.message} - ${error.details || 'Sem detalhes'} - Código: ${error.code}`)
      }

      console.log("Inserção mínima funcionou:", data)
      setTestResult("✅ Inserção mínima funcionou!")
      toast.success("Inserção mínima OK!")
      
    } catch (error) {
      console.error("Erro na inserção mínima:", error)
      setTestResult(`❌ Erro mínimo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      toast.error("Erro na inserção mínima")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testConnection} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testando..." : "Testar Conexão"}
          </Button>
          
          <Button 
            onClick={testCreateOrder} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Criando..." : "Testar Criação de Pedido"}
          </Button>
          
          <Button 
            onClick={testSimpleInsert} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Testando..." : "Teste Simples"}
          </Button>
          
          <Button 
            onClick={testMinimalOrder} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? "Testando..." : "Teste Mínimo"}
          </Button>
        </div>
        
        {testResult && (
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="text-sm">{testResult}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada"}</p>
          <p>Chave: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada"}</p>
          <p>URL (primeiros 20 chars): {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + "..." : "Não configurada"}</p>
          <p>Chave (primeiros 10 chars): {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10) + "..." : "Não configurada"}</p>
        </div>
      </CardContent>
    </Card>
  )
} 