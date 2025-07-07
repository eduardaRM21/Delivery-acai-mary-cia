"use client"

import { useState, useEffect } from "react"
import { OrderService, OrderWithItems } from "@/lib/order-service"
import { ThermalPrinter } from "@/lib/thermal-printer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Printer, 
  CheckCircle, 
  Clock, 
  Bike, 
  XCircle, 
  RefreshCw,
  Filter,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const ADMIN_PASSWORD = "mary&cia@painel";
const ADMIN_TOKEN_KEY = "admin_panel_access";

export default function AdminPanel() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [printer] = useState(new ThermalPrinter())
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(ADMIN_TOKEN_KEY) === "true") {
        setAuthorized(true);
      }
    }
  }, []);

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await OrderService.getAllOrders()
      setOrders(data)
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, newStatus as any)
      
      // Atualizar a lista local
      setOrders(prev => prev.map(order => 
        order.pedido.id === orderId 
          ? { ...order, pedido: { ...order.pedido, status: newStatus as any } }
          : order
      ))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const printOrder = async (orderWithItems: OrderWithItems) => {
    try {
      await printer.printOrder(orderWithItems.pedido, orderWithItems.itens)
    } catch (error) {
      console.error('Erro ao imprimir:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente': return <Clock className="w-4 h-4" />
      case 'Confirmado': return <CheckCircle className="w-4 h-4" />
      case 'Preparando': return <RefreshCw className="w-4 h-4" />
      case 'Pronto': return <CheckCircle className="w-4 h-4" />
      case 'Entregando': return <Bike className="w-4 h-4" />
      case 'Entregue': return <CheckCircle className="w-4 h-4" />
      case 'Cancelado': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500'
      case 'Confirmado': return 'bg-blue-500'
      case 'Preparando': return 'bg-orange-500'
      case 'Pronto': return 'bg-green-500'
      case 'Entregando': return 'bg-purple-500'
      case 'Entregue': return 'bg-green-600'
      case 'Cancelado': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`
  }

  const filteredOrders = orders.filter(orderWithItems => {
    const order = orderWithItems.pedido
    const matchesStatus = filterStatus === "all" || order.status === filterStatus
    const matchesSearch = searchTerm === "" || 
      (order.numero_pedido && order.numero_pedido.toString().includes(searchTerm)) ||
      (order.cliente?.nome && order.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.cliente?.telefone && order.cliente.telefone.includes(searchTerm))
    
    return matchesStatus && matchesSearch
  })

  const getOrderStats = () => {
    const total = orders.length
    const pending = orders.filter(o => o.pedido.status === 'Pendente').length
    const preparing = orders.filter(o => o.pedido.status === 'Preparando').length
    const ready = orders.filter(o => o.pedido.status === 'Pronto').length
    const delivering = orders.filter(o => o.pedido.status === 'Entregando').length

    return { total, pending, preparing, ready, delivering }
  }

  const stats = getOrderStats()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_TOKEN_KEY, "true");
      setAuthorized(true);
      setError("");
    } else {
      setError("Senha incorreta!");
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-xs">
          <h2 className="text-lg font-bold mb-4 text-center">Acesso Restrito</h2>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite a senha do painel"
            className="w-full border rounded px-3 py-2 mb-2"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Entrar</button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel de Pedidos</h1>
            <p className="text-gray-600">Gerencie todos os pedidos do Açaí da Mary & Cia</p>
          </div>
          <Link href="/dash">
            <Button variant="outline">Ir para Dashboard</Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Total</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-gray-100 p-1 md:p-2 rounded-full">
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Pendentes</p>
                  <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-1 md:p-2 rounded-full">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Preparando</p>
                  <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.preparing}</p>
                </div>
                <div className="bg-orange-100 p-1 md:p-2 rounded-full">
                  <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Prontos</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <div className="bg-green-100 p-1 md:p-2 rounded-full">
                  <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-2 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600">Entregando</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.delivering}</p>
                </div>
                <div className="bg-purple-100 p-1 md:p-2 rounded-full">
                  <Bike className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número do pedido, cliente ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendentes</SelectItem>
              <SelectItem value="Confirmado">Confirmados</SelectItem>
              <SelectItem value="Preparando">Preparando</SelectItem>
              <SelectItem value="Pronto">Prontos</SelectItem>
              <SelectItem value="Entregando">Entregando</SelectItem>
              <SelectItem value="Entregue">Entregues</SelectItem>
              <SelectItem value="Cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadOrders} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((orderWithItems) => {
              const order = orderWithItems.pedido
              const itens = orderWithItems.itens
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Informações principais */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Pedido #{order.numero_pedido}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(order.created_at)}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Cliente</p>
                            <p className="text-gray-900">{order.cliente?.nome || 'Não informado'}</p>
                            <p className="text-sm text-gray-600">{order.cliente?.telefone || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Endereço</p>
                            <p className="text-gray-900">{order.cliente?.endereco || 'Não informado'}</p>
                            {order.cliente?.distancia ? (
                              <p className="text-sm text-gray-600">Distância: {order.cliente.distancia}km</p>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Itens:</p>
                          <div className="space-y-1">
                            {itens.map((item, index) => (
                              <div key={index} className="text-sm text-gray-900">
                                {item.qtd}x {item.nome} - {formatPrice(item.preco * item.qtd)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              Subtotal: {
                                formatPrice(
                                  itens.reduce((sum, item) => {
                                    let itemTotal = item.preco * item.qtd;
                                    if (item.adicionais?.extras && item.adicionais.extras.length > 0) {
                                      itemTotal += item.adicionais.extras.reduce((acc, extra) => acc + (extra.preco * extra.quantidade), 0);
                                    }
                                    return sum + itemTotal;
                                  }, 0)
                                )
                              }
                            </p>
                            <p className="text-sm text-gray-600">
                              Pagamento: {order.pagamento?.toUpperCase() || 'NÃO INFORMADO'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Ações */}
                      <div className="flex flex-col gap-2 lg:ml-4">
                        <Button
                          onClick={() => printOrder(orderWithItems)}
                          variant="outline"
                          size="sm"
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimir
                        </Button>
                        
                        {order.status === 'Pendente' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Confirmado')}
                            size="sm"
                          >
                            Confirmar
                          </Button>
                        )}
                        
                        {order.status === 'Confirmado' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Preparando')}
                            size="sm"
                          >
                            Preparar
                          </Button>
                        )}
                        
                        {order.status === 'Preparando' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Pronto')}
                            size="sm"
                          >
                            Pronto
                          </Button>
                        )}
                        
                        {order.status === 'Pronto' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Entregando')}
                            size="sm"
                          >
                            Entregar
                          </Button>
                        )}
                        
                        {order.status === 'Entregando' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Entregue')}
                            size="sm"
                          >
                            Entregue
                          </Button>
                        )}
                        
                        {(order.status === 'Pendente' || order.status === 'Confirmado') && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'Cancelado')}
                            variant="destructive"
                            size="sm"
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
} 