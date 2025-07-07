"use client"

import { useState, useEffect } from "react"
import { OrderService, OrderWithItems } from "@/lib/order-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  Truck, 
  XCircle,
  Phone,
  MapPin,
  Calendar
} from "lucide-react"

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [searchPerformed, setSearchPerformed] = useState(false)

  const searchOrders = async () => {
    if (!phone.trim()) return
    
    try {
      setLoading(true)
      const data = await OrderService.getOrdersByPhone(phone.trim())
      setOrders(data)
      setSearchPerformed(true)
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendente': return <Clock className="w-4 h-4" />
      case 'Confirmado': return <CheckCircle className="w-4 h-4" />
      case 'Preparando': return <RefreshCw className="w-4 h-4" />
      case 'Pronto': return <CheckCircle className="w-4 h-4" />
      case 'Entregando': return <Truck className="w-4 h-4" />
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchOrders()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Histórico de Pedidos</h1>
          <p className="text-purple-200">Acompanhe todos os seus pedidos no Açaí da Mary & Cia</p>
        </div>

        {/* Busca */}
        <Card className="max-w-md mx-auto mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite seu telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="tel"
                    placeholder="(27) 98864-6488"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                onClick={searchOrders} 
                disabled={loading || !phone.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Pedidos
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {searchPerformed && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 mb-2">Nenhum pedido encontrado</p>
                  <p className="text-sm text-gray-400">
                    Verifique se o telefone está correto ou faça seu primeiro pedido!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="text-center text-white mb-4">
                  <p className="text-lg font-semibold">
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                {orders.map((orderWithItems) => {
                  const order = orderWithItems.pedido
                  const itens = orderWithItems.itens
                  
                  return (
                    <Card key={order.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              Pedido #{order.numero_pedido}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(order.created_at)}
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(order.status === 'Pronto' ? 'Preparando' : order.status)} text-white`}>
                            {getStatusIcon(order.status === 'Pronto' ? 'Preparando' : order.status)}
                            <span className="ml-1">{order.status === 'Pronto' ? 'Preparando' : order.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Informações do cliente */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Telefone</p>
                              <p className="text-gray-900">{order.cliente.telefone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 mt-1 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Endereço</p>
                              <p className="text-gray-900">{order.cliente.endereco}</p>
                              {order.cliente.distancia && (
                                <p className="text-sm text-gray-600">
                                  Distância: {order.cliente.distancia}km
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Itens do pedido */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                          <div className="space-y-2">
                            {itens.map((item, index) => (
                              <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.nome}</p>
                                  <p className="text-sm text-gray-600">Quantidade: {item.qtd}</p>
                                  
                                  {/* Adicionais */}
                                  {item.adicionais && (
                                    <div className="mt-2 space-y-1">
                                      {item.adicionais.coberturas && item.adicionais.coberturas.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          <strong>Coberturas:</strong> {item.adicionais.coberturas.join(', ')}
                                        </p>
                                      )}
                                      {item.adicionais.frutas && item.adicionais.frutas.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          <strong>Frutas:</strong> {item.adicionais.frutas.join(', ')}
                                        </p>
                                      )}
                                      {item.adicionais.complementos && item.adicionais.complementos.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                          <strong>Complementos:</strong> {item.adicionais.complementos.join(', ')}
                                        </p>
                                      )}
                                      {item.adicionais.extras && item.adicionais.extras.length > 0 && (
                                        <div className="text-xs text-gray-500">
                                          <strong>Adicionais:</strong>
                                          {item.adicionais.extras.map((extra: any, idx: number) => (
                                            <p key={idx} className="ml-2">
                                              {extra.nome} x{extra.quantidade} - {formatPrice(extra.preco * extra.quantidade)}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    {formatPrice(item.preco * item.qtd)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Resumo financeiro */}
                        <div className="border-t pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">{
                                formatPrice(
                                  itens.reduce((sum, item) => {
                                    // Valor base do item
                                    let itemTotal = item.preco * item.qtd;
                                    // Somar adicionais (extras)
                                    if (item.adicionais?.extras && item.adicionais.extras.length > 0) {
                                      itemTotal += item.adicionais.extras.reduce((acc, extra) => acc + (extra.preco * extra.quantidade), 0);
                                    }
                                    return sum + itemTotal;
                                  }, 0)
                                )
                              }</span>
                            </div>
                            {order.taxa_entrega > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Taxa de entrega:</span>
                                <span className="font-medium">{formatPrice(order.taxa_entrega)}</span>
                              </div>
                            )}
                            {order.desconto > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Desconto:</span>
                                <span className="font-medium text-green-600">-{formatPrice(order.desconto)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                              <span>Total:</span>
                              <span className="text-purple-600">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                          
                          {order.pagamento && (
                            <p className="text-sm text-gray-600 mt-2">
                              Forma de pagamento: {order.pagamento.toUpperCase()}
                            </p>
                          )}
                          
                          {order.obs && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm font-medium text-yellow-800">Observações:</p>
                              <p className="text-sm text-yellow-700">{order.obs}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-white mt-12">
          <p className="text-purple-200">
            Precisa de ajuda? Entre em contato: (27) 98864-6488
          </p>
        </div>
      </div>
    </div>
  )
} 