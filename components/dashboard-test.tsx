"use client"

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function DashboardTest() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const testDirectQueries = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      // Testar busca direta de pedidos
      console.log('Testando busca de pedidos...')
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .limit(5)
      
      if (pedidosError) {
        console.error('Erro ao buscar pedidos:', pedidosError)
        setTestResults([{ function: 'pedidos', status: 'ERRO', message: `${pedidosError.message} (${pedidosError.code || 'sem código'})` }])
      } else {
        console.log('Pedidos encontrados:', pedidos)
        setTestResults([{ function: 'pedidos', status: 'OK', message: `Encontrou ${pedidos?.length || 0} pedidos` }])
      }
      
      // Testar busca direta de itens
      console.log('Testando busca de itens...')
      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('*')
        .limit(5)
      
      if (itensError) {
        console.error('Erro ao buscar itens:', itensError)
        setTestResults(prev => [...prev, { function: 'itens', status: 'ERRO', message: `${itensError.message} (${itensError.code || 'sem código'})` }])
      } else {
        console.log('Itens encontrados:', itens)
        setTestResults(prev => [...prev, { function: 'itens', status: 'OK', message: `Encontrou ${itens?.length || 0} itens` }])
      }
      
      // Testar estrutura das tabelas
      console.log('Testando estrutura das tabelas...')
      const { data: pedidosStructure, error: pedidosStructureError } = await supabase
        .from('pedidos')
        .select('id, created_at, total, taxa_entrega')
        .limit(1)
      
      if (pedidosStructureError) {
        console.error('Erro ao verificar estrutura de pedidos:', pedidosStructureError)
        setTestResults(prev => [...prev, { function: 'estrutura_pedidos', status: 'ERRO', message: `Colunas não encontradas: ${pedidosStructureError.message}` }])
      } else {
        console.log('Estrutura de pedidos OK:', pedidosStructure)
        setTestResults(prev => [...prev, { function: 'estrutura_pedidos', status: 'OK', message: 'Colunas básicas encontradas' }])
      }

      // Testar busca por período (como o dashboard faz)
      console.log('Testando busca por período...')
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startStr = sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00'
      const endStr = today.toISOString().split('T')[0] + 'T23:59:59'
      
      const { data: pedidosPeriodo, error: pedidosPeriodoError } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .order('created_at', { ascending: true })
      
      if (pedidosPeriodoError) {
        console.error('Erro ao buscar pedidos por período:', pedidosPeriodoError)
        setTestResults(prev => [...prev, { function: 'pedidos_periodo', status: 'ERRO', message: `Erro na busca por período: ${pedidosPeriodoError.message}` }])
      } else {
        console.log('Pedidos por período encontrados:', pedidosPeriodo)
        setTestResults(prev => [...prev, { function: 'pedidos_periodo', status: 'OK', message: `Encontrou ${pedidosPeriodo?.length || 0} pedidos nos últimos 7 dias` }])
      }
      
    } catch (error) {
      console.error('Erro nos testes diretos:', error)
      setTestResults([{ function: 'Queries Diretas', status: 'ERRO', message: error instanceof Error ? error.message : 'Erro desconhecido' }])
    } finally {
      setLoading(false)
    }
  }

  const testDashboardData = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      // Simular exatamente o que o dashboard faz
      console.log('Testando dados do dashboard...')
      
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const startStr = sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00'
      const endStr = today.toISOString().split('T')[0] + 'T23:59:59'
      
      // Buscar pedidos
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', startStr)
        .lte('created_at', endStr)
        .order('created_at', { ascending: true })
      
      if (pedidosError) {
        setTestResults([{ function: 'dashboard_pedidos', status: 'ERRO', message: pedidosError.message }])
        return
      }
      
      // Calcular resumo
      const totalOrders = pedidos?.length || 0
      const totalRevenue = pedidos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
      const totalDeliveryFees = pedidos?.reduce((sum, p) => sum + (p.taxa_entrega || p.taxa_entraga || 0), 0) || 0
      const netRevenue = totalRevenue - totalDeliveryFees
      
      setTestResults([
        { function: 'dashboard_pedidos', status: 'OK', message: `Encontrou ${totalOrders} pedidos` },
        { function: 'dashboard_faturamento_bruto', status: 'OK', message: `R$ ${totalRevenue.toFixed(2)}` },
        { function: 'dashboard_faturamento_liquido', status: 'OK', message: `R$ ${netRevenue.toFixed(2)}` },
        { function: 'dashboard_taxas_entrega', status: 'OK', message: `R$ ${totalDeliveryFees.toFixed(2)}` }
      ])
      
      // Buscar produtos se houver pedidos
      if (pedidos && pedidos.length > 0) {
        const { data: itens, error: itensError } = await supabase
          .from('itens')
          .select('nome, qtd, pedido_id')
          .in('pedido_id', pedidos.map(p => p.id))
        
        if (!itensError && itens) {
          const productMap = new Map()
          itens.forEach(item => {
            const existing = productMap.get(item.nome) || 0
            productMap.set(item.nome, existing + item.qtd)
          })
          
          const topProducts = Array.from(productMap.entries())
            .map(([product, quantity]) => ({ product, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5)
          
          setTestResults(prev => [...prev, { 
            function: 'dashboard_produtos', 
            status: 'OK', 
            message: `Top ${topProducts.length} produtos encontrados` 
          }])
        }
      }
      
    } catch (error) {
      console.error('Erro no teste do dashboard:', error)
      setTestResults([{ function: 'Dashboard', status: 'ERRO', message: error instanceof Error ? error.message : 'Erro desconhecido' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Teste do Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDirectQueries} disabled={loading}>
            {loading ? 'Testando...' : 'Testar Queries Diretas'}
          </Button>
          <Button onClick={testDashboardData} disabled={loading} variant="outline">
            {loading ? 'Testando...' : 'Testar Dados do Dashboard'}
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Resultados:</h3>
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                result.status === 'OK' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    result.status === 'OK' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.function}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 