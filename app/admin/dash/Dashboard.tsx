'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, DollarSign, Truck, CalendarDays, TrendingUp, Calculator } from 'lucide-react'
import { format, subDays, formatISO, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { DashboardTest } from '@/components/dashboard-test'
import { DateFormatTest } from '@/components/date-format-test'
import { 
  BRAZIL_TIMEZONE, 
  convertToBrazilTime, 
  formatBrazilDate,
  getStartOfDayUTC,
  getEndOfDayUTC
} from '@/lib/utils'

interface Summary {
  orders: number
  revenue: number
  deliveryfees: number
  netRevenue: number
}

interface OrderByDay {
  date: string
  orders: number
  revenue: number
}

interface TopProduct {
  product: string
  quantity: number
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Função para formatar moeda brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Componente customizado para tooltip do gráfico de linha
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name === 'Pedidos' ? entry.value : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Componente customizado para tooltip do gráfico de barras
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-blue-600">
          Quantidade: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [range, setRange] = useState<'7d' | '30d' | null>('7d')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [ordersByDay, setOrdersByDay] = useState<OrderByDay[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let start: Date, end: Date
        if (range === '7d') {
          start = subDays(new Date(), 6)
          end = new Date()
        } else if (range === '30d') {
          start = subDays(new Date(), 29)
          end = new Date()
        } else if (startDate && endDate) {
          start = parseISO(startDate)
          end = parseISO(endDate)
        } else {
          return
        }
        
        // NOVO: Converter início e fim do período para UTC considerando o fuso de São Paulo
        const startUTC = getStartOfDayUTC(start)
        const endUTC = getEndOfDayUTC(end)
        const startStr = format(startUTC, 'yyyy-MM-dd\'T\'HH:mm:ss')
        const endStr = format(endUTC, 'yyyy-MM-dd\'T\'HH:mm:ss')
        
        console.log('Buscando dados para período:', startStr, 'até', endStr)
        console.log('Fuso horário:', BRAZIL_TIMEZONE)
        
        // Usar queries diretas (mais confiável)
        console.log('Usando queries diretas...')
        
        // Buscar pedidos do período
        const { data: pedidos, error: pedidosError } = await supabase
          .from('pedidos')
          .select('*')
          .gte('created_at', startStr)
          .lte('created_at', endStr)
          .order('created_at', { ascending: true })
        
        if (pedidosError) {
          console.error('Erro ao buscar pedidos:', pedidosError)
          return
        }
        
        console.log('Pedidos encontrados:', pedidos?.length || 0)
        
        // Processar dados diários no fuso horário brasileiro
        const dailyMap = new Map()
        pedidos?.forEach(pedido => {
          // Converter para horário de São Paulo
          const brazilDate = convertToBrazilTime(pedido.created_at)
          const date = format(brazilDate, 'dd/MM')
          const existing = dailyMap.get(date) || { date, orders: 0, revenue: 0 }
          existing.orders += 1
          existing.revenue += pedido.total || 0
          dailyMap.set(date, existing)
        })
        const daily = Array.from(dailyMap.values())
        
        // Calcular resumo
        const totalOrders = pedidos?.length || 0
        const totalRevenue = pedidos?.reduce((sum, p) => sum + (p.total || 0), 0) || 0
        const totalDeliveryFees = pedidos?.reduce((sum, p) => sum + (p.taxa_entrega || p.taxa_entraga || 0), 0) || 0
        const netRevenue = totalRevenue - totalDeliveryFees
        
        const sum = {
          orders: totalOrders,
          revenue: totalRevenue,
          deliveryfees: totalDeliveryFees,
          netRevenue: netRevenue
        }
        
        // Buscar produtos mais vendidos
        let products: TopProduct[] = []
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
            
            products = Array.from(productMap.entries())
              .map(([product, quantity]) => ({ product, quantity }))
              .sort((a, b) => b.quantity - a.quantity)
              .slice(0, 10)
          }
        }

        setOrdersByDay(daily)
        setSummary(sum)
        setTopProducts(products)
        
        console.log('Dados carregados:', { daily, sum, products })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [range, startDate, endDate])

  const SummaryCard = ({ icon: Icon, label, value, subtitle }: { 
    icon: any; 
    label: string; 
    value: string | number;
    subtitle?: string;
  }) => (
    <Card className="rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="flex items-center gap-3 py-5">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-none text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  )

  const getPeriodText = () => {
    if (range === '7d') return 'Últimos 7 dias'
    if (range === '30d') return 'Últimos 30 dias'
    if (startDate && endDate) {
      const start = format(parseISO(startDate), 'dd/MM/yyyy', { locale: ptBR })
      const end = format(parseISO(endDate), 'dd/MM/yyyy', { locale: ptBR })
      return `${start} a ${end}`
    }
    return '–'
  }

  return (
    <div className="p-4 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Acompanhe o desempenho do seu negócio</p>
          <p className="text-xs text-gray-500">Fuso horário: São Paulo/Brasília (GMT-3)</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Voltar para Admin</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-md">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <Button 
                variant={range === '7d' ? 'default' : 'outline'} 
                onClick={() => { setRange('7d'); setStartDate(''); setEndDate('') }}
                disabled={loading}
              >
                Últimos 7 dias
              </Button>
              <Button 
                variant={range === '30d' ? 'default' : 'outline'} 
                onClick={() => { setRange('30d'); setStartDate(''); setEndDate('') }}
                disabled={loading}
              >
                Últimos 30 dias
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={e => { setStartDate(e.target.value); setRange(null) }}
                className="border rounded px-3 py-2 text-sm"
                disabled={loading}
              />
              <span className="mx-1 text-gray-500">até</span>
              <input
                type="date"
                value={endDate}
                onChange={e => { setEndDate(e.target.value); setRange(null) }}
                className="border rounded px-3 py-2 text-sm"
                disabled={loading}
              />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Carregando...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard 
          icon={ShoppingBag} 
          label="Total de Pedidos" 
          value={summary?.orders ?? '–'} 
          subtitle="Pedidos realizados"
        />
        <SummaryCard 
          icon={DollarSign} 
          label="Faturamento Bruto" 
          value={summary ? formatCurrency(summary.revenue) : '–'} 
          subtitle="Valor total das vendas"
        />
        <SummaryCard 
          icon={Calculator} 
          label="Faturamento Líquido" 
          value={summary ? formatCurrency(summary.netRevenue) : '–'} 
          subtitle="Bruto - Taxas de entrega"
        />
        <SummaryCard 
          icon={Truck} 
          label="Taxas de Entrega" 
          value={summary ? formatCurrency(summary.deliveryfees) : '–'} 
          subtitle="Total das taxas cobradas"
        />
        <SummaryCard 
          icon={CalendarDays} 
          label="Período Analisado" 
          value={getPeriodText()} 
          subtitle="Filtro de datas aplicado"
        />
      </div>

      {/* Orders line chart */}
      <Card className="rounded-2xl shadow-md">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pedidos & Faturamento por Dia</h2>
              <p className="text-gray-600">Evolução diária das vendas e faturamento (Horário de São Paulo)</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Pedidos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Faturamento</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={ordersByDay} margin={{ right: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Quantidade de Pedidos', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Faturamento (R$)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="orders" 
                name="Pedidos" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                name="Faturamento (R$)" 
                stroke="#16a34a" 
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top products bar chart */}
      <Card className="rounded-2xl shadow-md">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Produtos Mais Vendidos</h2>
              <p className="text-gray-600">Ranking dos produtos com maior quantidade vendida</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Top {topProducts.length} produtos</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topProducts} margin={{ right: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="product" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Quantidade Vendida', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar 
                dataKey="quantity" 
                name="Quantidade" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Debug section - remover depois que estiver funcionando */}
      <Card className="rounded-2xl shadow-md">
        <CardContent className="py-6">
          <DashboardTest />
        </CardContent>
      </Card>

      {/* Teste de formatação de data */}
      <DateFormatTest />
    </div>
  )
}

